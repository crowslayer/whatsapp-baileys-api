import {
  ICampaignListItem,
  ICampaignReadRepository,
} from '@domain/campaign/ICampaignReadRepository';

export class SummaryFinder {
  constructor(private readonly repository: ICampaignReadRepository) {}

  async execute(campaignId: string): Promise<ICampaignListItem | null> {
    return await this.repository.getSummary(campaignId);
  }
}
