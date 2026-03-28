import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { ChatsUpdater } from './ChatsUpdater';
import { UpdateChatsCommand } from './UpdateChatsCommand';

export class UpdateChatsCommandHandler implements ICommandHandler<UpdateChatsCommand> {
  constructor(private readonly updater: ChatsUpdater) {}

  subscribedTo(): typeof UpdateChatsCommand {
    return UpdateChatsCommand;
  }
  async handle(command: UpdateChatsCommand): Promise<void> {
    await this.updater.execute(command);
  }
}
