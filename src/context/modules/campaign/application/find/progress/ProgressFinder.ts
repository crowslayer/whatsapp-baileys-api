import { ICampaignReadRepository } from '@modules/campaign/domain/ICampaignReadRepository';

export class ProgressFinder {
  constructor(private readonly repository: ICampaignReadRepository) {}

  async execute(campaignId: string): Promise<number> {
    const progress = await this.repository.getProgress(campaignId);
    if (!progress) {
      return 0;
    }
    return progress;
  }
}
