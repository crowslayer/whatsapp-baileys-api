import { CampaignUpdater } from '@application/campaign/update/CampaignUpdater';
import { UpdateCampaignCommand } from '@application/campaign/update/UpdateCampaignCommand';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class UpdateCampaignCommandHandler implements ICommandHandler<UpdateCampaignCommand> {
  constructor(private readonly updater: CampaignUpdater) {}

  subscribedTo(): typeof UpdateCampaignCommand {
    return UpdateCampaignCommand;
  }

  async handle(command: UpdateCampaignCommand): Promise<void> {
    return await this.updater.execute(command);
  }
}
