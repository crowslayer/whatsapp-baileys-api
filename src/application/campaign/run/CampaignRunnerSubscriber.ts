import { CampaignScheduler } from '@application/campaign/processor/CampaignScheduler';
import { CampaignInitializeEvent } from '@application/campaign/run/event/CampaignInitializeEvent';
import { CampaignRetryer } from '@application/campaign/run/retry/CampaignRetryer';
import { CampaignRunner } from '@application/campaign/run/runner/CampaignRunner';

import { IDomainEventSubscriber } from '@shared/domain/IDomainEventSubscriber';

export class CampaignRunnerSubscriber implements IDomainEventSubscriber<CampaignInitializeEvent> {
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
