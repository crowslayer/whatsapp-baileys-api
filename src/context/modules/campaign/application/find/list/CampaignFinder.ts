import {
  CampaignReadModel,
  ICampaignReadRepository,
} from '@modules/campaign/domain/ICampaignReadRepository';

export class CampaignFinder {
  constructor(private readonly repository: ICampaignReadRepository) {}

  async execute(limit: number = 20, skip: number = 0): Promise<CampaignReadModel[]> {
    const campaigns = await this.repository.list(limit, skip);

    return campaigns || [];
  }
}
