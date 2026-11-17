import { CampaignId } from '@modules/campaign/domain/CampaignId';
import { ICampaignRepository } from '@modules/campaign/domain/ICampaignRepository';

export class CampaignEraser {
  constructor(private readonly repository: ICampaignRepository) {}

  async execute(campaignId: string): Promise<void> {
    await this.repository.delete(CampaignId.fromString(campaignId));
  }
}
