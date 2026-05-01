import { CampaignId } from '@domain/campaign/CampaignId';

import { Command } from '@shared/domain/commands/Command';

export class DeleteCampaignCommand extends Command<void> {
  constructor(readonly campaignId: CampaignId) {
    super();
  }
}
