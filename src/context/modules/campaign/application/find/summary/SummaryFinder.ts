import {
  CampaignReadModel,
  ICampaignReadRepository,
} from '@modules/campaign/domain/ICampaignReadRepository';

export class SummaryFinder {
  constructor(private readonly repository: ICampaignReadRepository) {}

  async execute(campaignId: string): Promise<CampaignReadModel | null> {
    const campaign = await this.repository.getSummary(campaignId);
    if (!campaign) return null;
    return campaign;
  }
}
