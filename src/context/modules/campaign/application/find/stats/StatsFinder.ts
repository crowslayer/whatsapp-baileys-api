import {
  CampaignStats,
  ICampaignReadRepository,
} from '@modules/campaign/domain/ICampaignReadRepository';

export class StatsFinder {
  constructor(private readonly repository: ICampaignReadRepository) {}

  execute(): Promise<CampaignStats> {
    return this.repository.getStats();
  }
}
