import { ICampaignReadRepository } from '@domain/campaign/ICampaignReadRepository';

export class ProgressFinder {
  constructor(private readonly repository: ICampaignReadRepository) {}

  async execute(campaignId: string): Promise<number> {
    return await this.repository.getProgress(campaignId);
  }
}
