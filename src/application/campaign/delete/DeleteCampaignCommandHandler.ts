import { CampaignEraser } from '@application/campaign/delete/CampaignEraser';
import { DeleteCampaignCommand } from '@application/campaign/delete/DeleteCampaignCommand';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class DeleteCampaignCommandHandler implements ICommandHandler<DeleteCampaignCommand> {
  constructor(private readonly eraser: CampaignEraser) {}

  subscribedTo(): typeof DeleteCampaignCommand {
    return DeleteCampaignCommand;
  }

  async handle(command: DeleteCampaignCommand): Promise<void> {
    await this.eraser.execute(command.campaignId);
  }
}
