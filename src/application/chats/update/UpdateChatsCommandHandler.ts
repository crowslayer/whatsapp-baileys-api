import { ChatsUpdater } from '@application/chats/update/ChatsUpdater';
import { UpdateChatsCommand } from '@application/chats/update/UpdateChatsCommand';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class UpdateChatsCommandHandler implements ICommandHandler<UpdateChatsCommand> {
  constructor(private readonly updater: ChatsUpdater) {}

  subscribedTo(): typeof UpdateChatsCommand {
    return UpdateChatsCommand;
  }
  async handle(command: UpdateChatsCommand): Promise<void> {
    await this.updater.execute(command);
  }
}
