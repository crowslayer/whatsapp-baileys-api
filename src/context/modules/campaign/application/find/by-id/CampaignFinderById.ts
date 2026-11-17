import {
  CampaignReadModel,
  ICampaignReadRepository,
} from '@modules/campaign/domain/ICampaignReadRepository';

export class CampaignFinderById {
  constructor(private readonly repository: ICampaignReadRepository) {}

  async execute(campaignId: string): Promise<CampaignReadModel | null> {
    const campaign = await this.repository.getById(campaignId);

    return campaign ?? null;
  }
}
