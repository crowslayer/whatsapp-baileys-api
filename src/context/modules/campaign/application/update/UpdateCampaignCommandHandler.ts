import { ICommandHandler } from '@shared/domain/command/CommandHandler';
import { DomainError } from '@shared/domain/error/DomainError';

import { CampaignUpdater } from '@modules/campaign/application/update/CampaignUpdater';
import { UpdateCampaignCommand } from '@modules/campaign/application/update/UpdateCampaignCommand';

export class UpdateCampaignCommandHandler implements ICommandHandler<UpdateCampaignCommand> {
  constructor(private readonly useCase: CampaignUpdater) {}

  subscribedTo(): typeof UpdateCampaignCommand {
    return UpdateCampaignCommand;
  }

  async handle(command: UpdateCampaignCommand): Promise<void> {
    try {
      return await this.useCase.execute(command);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw error;
    }
  }
}
