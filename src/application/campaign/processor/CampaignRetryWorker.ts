import { setTimeout as delay } from 'node:timers/promises';

import { CampaignAggregate } from '@domain/campaign/CampaignAggregate';
import { ICampaignRepository } from '@domain/campaign/ICampaignRepository';

import { CampaignDispatcher } from '@application/campaign/processor/CampaignDispatcher';
import { InstanceRateLimiterFactory } from '@application/campaign/processor/InstanceRateLimiterFactory';
import { IConnectionEventBus } from '@application/events/IConnectionEventBus';
import { MessageOrchestrator } from '@application/services/MessageOrchestrator';

import { ILogger } from '@infrastructure/loggers/Logger';

export class CampaignRetryWorker {
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
        await delay(3000);
        continue;
      }

      try {
        await this.processCampaign(campaign, workerId);
      } catch (error) {
        this.logger.error({
          event: 'WORKER.ERROR',
          workerId,
          error,
        });
        await this.repo.releaseLock(campaign.campaignId, workerId);
      }
    }
  }

  // ===============================
  // CORE
  // ===============================
  // eslint-disable-next-line
  private async processCampaign(campaign: CampaignAggregate, workerId: string): Promise<void> {
    const limiter = this.limiterFactory.get(campaign.instanceId.value);

    let success = 0;
    let failed = 0;

    while (true) {
      const fresh = await this.repo.findById(campaign.campaignId);

      // pérdida de lock
      if (!fresh || fresh.lockedBy !== workerId) {
        this.logger.warn({
          event: 'LOCK.LOST',
          campaignId: campaign.id,
          workerId,
        });
        return;
      }

      // pausa manual
      if (fresh.status !== 'running') {
        await this.repo.releaseLock(campaign.campaignId, workerId);
        return;
      }

      const index = this.findNextRecipient(fresh);

      // campaña terminada
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

        success++;
      } catch (error) {
        let errorMessage = '';
        if (error instanceof Error) errorMessage = error.message;

        const attempts = (recipient.attempts ?? 0) + 1;
        // límite de intentos
        if (attempts >= 3) {
          await this.repo.updateProgress(fresh.campaignId, index, {
            ...recipient,
            status: 'failed',
            attempts,
            lastError: errorMessage,
            retryAt: null,
          });
          failed++;
        } else {
          //  retry inteligente
          const retryAt = new Date(Date.now() + this.getRetryDelay(attempts));

          await this.repo.updateProgress(fresh.campaignId, index, {
            ...recipient,
            status: 'pending',
            attempts,
            lastError: errorMessage,
            retryAt,
          });
        }
      } // catvh
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
      // detección de bloqueo
      if (this.detectBanRisk(success, failed)) {
        this.logger.warn({
          event: 'BAN.RISK',
          campaignId: campaign.id,
        });

        await this.repo.releaseLock(fresh.campaignId, workerId);
        return;
      }
    }
    // ===============================
    // FINALIZACIÓN
    // ===============================
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

  private findNextRecipient(campaign: CampaignAggregate): number {
    const now = Date.now();

    return campaign.recipients.findIndex((r) => {
      const isPending = r.status === 'pending';
      const canRetry = !r.retryAt || r.retryAt.getTime() <= now;

      return isPending && canRetry;
    });
  }

  // ===============================
  // HUMAN-LIKE DELAYS
  // ===============================
  private async delayControl(i: number): Promise<void> {
    await this.sleep(800 + Math.random() * 1000);

    if (i % 20 === 0) {
      await this.sleep(5000 + Math.random() * 5000);
    }

    if (i % 100 === 0) {
      await this.sleep(20000 + Math.random() * 15000);
    }
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
  // BACKOFF
  // ===============================
  private getRetryDelay(attempts: number): number {
    const base = 5000; // 5s
    const max = 5 * 60 * 1000; // 5 min

    const delay = Math.min(base * Math.pow(2, attempts), max);

    return delay + Math.random() * 2000;
  }

  private sleep(ms: number): Promise<void> {
    return delay(ms);
  }
}
