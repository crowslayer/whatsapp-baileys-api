import { ICommandHandler } from '@shared/domain/command/CommandHandler';
import { DomainError } from '@shared/domain/error/DomainError';

import { CampaignEraser } from '@modules/campaign/application/delete/CampaignEraser';
import { DeleteCampaignCommand } from '@modules/campaign/application/delete/DeleteCampaignCommand';

export class DeleteCampaignCommandHandler implements ICommandHandler<DeleteCampaignCommand> {
  constructor(private readonly useCase: CampaignEraser) {}

  subscribedTo(): typeof DeleteCampaignCommand {
    return DeleteCampaignCommand;
  }

  async handle(command: DeleteCampaignCommand): Promise<void> {
    try {
      await this.useCase.execute(command.campaignId);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      throw error;
    }
  }
}
