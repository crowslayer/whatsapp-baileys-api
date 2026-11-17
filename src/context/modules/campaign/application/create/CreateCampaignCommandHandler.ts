import { ICommandHandler } from '@shared/domain/command/CommandHandler';
import { DomainError } from '@shared/domain/error/DomainError';

import { CampaignCreator } from '@modules/campaign/application/create/CampaignCreator';
import { CreateCampaignCommand } from '@modules/campaign/application/create/CreateCampaignCommand';

export class CreateCampaignCommandHandler implements ICommandHandler<CreateCampaignCommand> {
  constructor(private readonly useCase: CampaignCreator) {}

  subscribedTo(): typeof CreateCampaignCommand {
    return CreateCampaignCommand;
  }

  async handle(command: CreateCampaignCommand): Promise<void> {
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
