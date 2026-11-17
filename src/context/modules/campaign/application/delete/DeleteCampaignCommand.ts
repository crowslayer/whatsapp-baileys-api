import { Command } from '@shared/domain/command/Command';

export class DeleteCampaignCommand extends Command<void> {
  constructor(readonly campaignId: string) {
    super();
  }
}
