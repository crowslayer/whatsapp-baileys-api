import { CampaignRetryWorker } from '@modules/campaign/application/processor/CampaignRetryWorker';

export class CampaignRetryer {
  constructor(private readonly retryWorker: CampaignRetryWorker) {}

  async execute(workerId: string): Promise<void> {
    await this.retryWorker.run(`${workerId}-retry`);
  }
}
