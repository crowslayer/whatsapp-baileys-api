import { CampaignCreator } from '@application/campaign/create/CampaignCreator';
import { CreateCampaignCommand } from '@application/campaign/create/CreateCampaignCommand';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class CreateCampaignCommandHandler implements ICommandHandler<CreateCampaignCommand> {
  constructor(private readonly creator: CampaignCreator) {}

  subscribedTo(): typeof CreateCampaignCommand {
    return CreateCampaignCommand;
  }

  async handle(command: CreateCampaignCommand): Promise<void> {
    return await this.creator.execute(command);
  }
}
