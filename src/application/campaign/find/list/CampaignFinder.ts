import {
  ICampaignListItem,
  ICampaignReadRepository,
} from '@domain/campaign/ICampaignReadRepository';

export class CampaignFinder {
  constructor(private readonly repository: ICampaignReadRepository) {}

  async execute(limit: number = 20, skip: number = 0): Promise<ICampaignListItem[]> {
    return await this.repository.list(limit, skip);
  }
}
