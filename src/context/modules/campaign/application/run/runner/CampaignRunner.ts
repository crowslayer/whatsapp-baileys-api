import { CampaignProcessor } from '@modules/campaign/application/processor/CampaignProcessor';

export class CampaignRunner {
  constructor(private readonly processor: CampaignProcessor) {}

  async execute(workerId: string): Promise<void> {
    await this.processor.run(workerId);
  }
}
