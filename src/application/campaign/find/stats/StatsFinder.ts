import { ICampaignReadRepository, ICampaignStats } from '@domain/campaign/ICampaignReadRepository';

export class StatsFinder {
  constructor(private readonly repository: ICampaignReadRepository) {}

  async execute(): Promise<ICampaignStats> {
    return await this.repository.getStats();
  }
}
