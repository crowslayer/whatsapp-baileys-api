import { CampaignId } from '@domain/campaign/CampaignId';
import { ICampaignRepository } from '@domain/campaign/ICampaignRepository';

export class CampaignEraser {
  constructor(private readonly repository: ICampaignRepository) {}

  async execute(campaignId: CampaignId): Promise<void> {
    await this.repository.delete(campaignId);
  }
}
