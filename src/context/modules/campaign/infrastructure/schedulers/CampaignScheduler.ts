import { setTimeout as delay } from 'node:timers/promises';

import { ILogger } from '@shared/domain/Logger';

import { ICampaignRepository } from '@modules/campaign/domain/ICampaignRepository';

export class CampaignScheduler {
  constructor(
    private readonly repo: ICampaignRepository,
    private readonly logger: ILogger
  ) {}

  async run(): Promise<void> {
    while (true) {
      let activated = 0;

      while (true) {
        const campaign = await this.repo.activateNextScheduled();
        if (!campaign) break;
        activated++;
      }

      if (activated > 0) {
        this.logger.info(`[Scheduler] Activated ${activated} campaigns`);
      }

      await this.sleep(5000);
    }
  }

  private sleep(ms: number): Promise<void> {
    return delay(ms);
  }
}
