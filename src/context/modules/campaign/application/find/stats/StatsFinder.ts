import {
  CampaignStats,
  ICampaignReadRepository,
} from '@modules/campaign/domain/ICampaignReadRepository';

export class StatsFinder {
  constructor(private readonly repository: ICampaignReadRepository) {}

  async execute(): Promise<CampaignStats> {
    return await this.repository.getStats();
  }
}
