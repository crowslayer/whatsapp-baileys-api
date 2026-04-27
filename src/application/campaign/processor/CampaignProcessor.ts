import { setTimeout as delay } from 'node:timers/promises';

import { CampaignAggregate } from '@domain/campaign/CampaignAggregate';
import { ICampaignRepository } from '@domain/campaign/ICampaignRepository';

import { CampaignDispatcher } from '@application/campaign/processor/CampaignDispatcher';
import { InstanceRateLimiterFactory } from '@application/campaign/processor/InstanceRateLimiterFactory';
import { IConnectionEventBus } from '@application/events/IConnectionEventBus';
import { MessageOrchestrator } from '@application/services/MessageOrchestrator';

import { ILogger } from '@infrastructure/loggers/Logger';

export class CampaignProcessor {
  constructor(
    private readonly repo: ICampaignRepository,
    private readonly orchestrator: MessageOrchestrator,
    private readonly limiterFactory: InstanceRateLimiterFactory,
    private readonly dispatcher: CampaignDispatcher,
    private readonly eventBus: IConnectionEventBus,
    private readonly logger: ILogger
  ) {}

  async run(workerId: string): Promise<void> {
    this.logger.info({ event: 'WORKER.START', workerId });

    while (true) {
      const campaign = await this.dispatcher.pick(workerId);

      if (!campaign) {
        await this.sleep(2000);
        continue;
      }

      try {
        await this.executeCampaign(campaign, workerId);
      } catch (error) {
        this.logger.error({ event: 'WORKER.ERROR', error });
      }
    }
  }

  // eslint-disable-next-line
  private async executeCampaign(campaign: CampaignAggregate, workerId: string): Promise<void> {
    const limiter = this.limiterFactory.get(campaign.instanceId.value);

    let success = 0;
    let failed = 0;

    while (true) {
      const fresh = await this.repo.findById(campaign.campaignId);

      // pérdida de lock
      if (!fresh || fresh.lockedBy !== workerId) {
        this.logger.warn('Lost lock, exiting campaign');
        return;
      }

      // pausado manual
      if (fresh.status !== 'running') {
        await this.repo.releaseLock(campaign.campaignId, workerId);
        return;
      }

      const index = this.findNextRecipient(fresh);

      if (index === -1) break;

      const recipient = fresh.recipients[index];

      try {
        await limiter.waitTurn();

        await this.orchestrator.send(fresh.instanceId.value, recipient.jid, fresh.message);

        await this.repo.updateProgress(fresh.campaignId, index, {
          ...recipient,
          status: 'sent',
          retryAt: null,
        });
        // this.eventBus.emit|({
        //   type: 'campaign.message.sent',
        //   payload: {
        //     campaignId,
        //     jid
        //   }
        // });
        success++;
      } catch (error) {
        let errorMessage = '';
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        const attempts = (recipient.attempts ?? 0) + 1;

        const retryAt = new Date(Date.now() + this.getRetryDelay(attempts));
        if (attempts >= 3) {
          await this.repo.updateProgress(fresh.campaignId, index, {
            ...recipient,
            status: 'failed',
            attempts,
            lastError: errorMessage,
          });

          failed++;
        } else {
          await this.repo.updateProgress(fresh.campaignId, index, {
            ...recipient,
            status: 'pending',
            attempts,
            lastError: errorMessage,
            retryAt,
          });
        }
      }
      this.eventBus.emit('campaignProgress', {
        campaignId: campaign.id,
        sent: success,
        failed,
        total: success + failed,
      });
      // heartbeat del lock
      await this.repo.extendLock(fresh.campaignId, workerId);

      // delays anti-ban
      await this.delayControl(success + failed);

      // detección básica de bloqueo
      if (this.detectBanRisk(success, failed)) {
        this.logger.warn({ event: 'BAN_RISK' });
        await this.repo.releaseLock(fresh.campaignId, workerId);
        return;
      }
    }

    await this.repo.complete(campaign.campaignId);

    await this.repo.releaseLock(campaign.campaignId, workerId);

    this.logger.info({
      event: 'CAMPAIGN.COMPLETED',
      campaignId: campaign.id,
      success,
      failed,
      total: campaign.recipients.length,
    });
  }

  // ===============================
  // NEXT RECIPIENT LOGIC (CRÍTICO)
  // ===============================
  private findNextRecipient(campaign: CampaignAggregate): number {
    const now = Date.now();

    // random start → evita hotspots
    const start = Math.floor(Math.random() * campaign.recipients.length);

    for (let i = 0; i < campaign.recipients.length; i++) {
      const index = (start + i) % campaign.recipients.length;
      const r = campaign.recipients[index];

      if (r.status === 'pending' && (!r.retryAt || r.retryAt.getTime() <= now)) {
        return index;
      }
    }

    return -1;
  }

  // ===============================
  // BAN DETECTION
  // ===============================
  private detectBanRisk(success: number, failed: number): boolean {
    const total = success + failed;

    if (total < 20) return false;

    const failureRate = failed / total;

    return failureRate > 0.4;
  }

  // ===============================
  // HUMAN DELAY
  // ===============================
  private async delayControl(i: number): Promise<void> {
    await this.sleep(800 + Math.random() * 1000);

    if ((i + 1) % 20 === 0) {
      await this.sleep(5000 + Math.random() * 5000);
    }

    if ((i + 1) % 100 === 0) {
      await this.sleep(20000 + Math.random() * 15000);
    }
  }

  private getRetryDelay(attempts: number): number {
    const base = 5000; // 5s
    const max = 5 * 60 * 1000; // 5 min

    const delay = Math.min(base * Math.pow(2, attempts), max);

    return delay + Math.random() * 2000; // jitter
  }

  private sleep(ms: number): Promise<void> {
    return delay(ms);
  }
}
