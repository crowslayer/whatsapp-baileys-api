import { IEventSubscriber } from '@shared/domain/event/IEventSubscriber';

import { CampaignInitializeEvent } from '@modules/campaign/application/run/event/CampaignInitializeEvent';
import { CampaignRetryer } from '@modules/campaign/application/run/retry/CampaignRetryer';
import { CampaignRunner } from '@modules/campaign/application/run/runner/CampaignRunner';
import { CampaignScheduler } from '@modules/campaign/infrastructure/schedulers/CampaignScheduler';

export class CampaignRunnerSubscriber implements IEventSubscriber<CampaignInitializeEvent> {
  constructor(
    private readonly runner: CampaignRunner,
    private readonly retryer: CampaignRetryer,
    private readonly scheduler: CampaignScheduler
  ) {}

  subscribedTo(): [typeof CampaignInitializeEvent] {
    return [CampaignInitializeEvent];
  }

  async on(event: CampaignInitializeEvent): Promise<void> {
    const data = event.payload;

    const workerId = data.workerId;
    this.runner.execute(workerId);
    this.retryer.execute(workerId);
    await this.scheduler.run();
  }
}
