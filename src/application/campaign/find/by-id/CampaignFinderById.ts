import { ICampaignItem, ICampaignReadRepository } from '@domain/campaign/ICampaignReadRepository';

export class CampaignFinderById {
  constructor(private readonly repository: ICampaignReadRepository) {}

  async execute(campaignId: string): Promise<ICampaignItem | null> {
    return await this.repository.getById(campaignId);
  }
}
