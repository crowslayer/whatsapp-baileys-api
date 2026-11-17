import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { ChatsUpdater } from '@modules/chats/application/update/ChatsUpdater';
import { UpdateChatsCommand } from '@modules/chats/application/update/UpdateChatsCommand';

export class UpdateChatsCommandHandler implements ICommandHandler<UpdateChatsCommand> {
  constructor(private readonly updater: ChatsUpdater) {}

  subscribedTo(): typeof UpdateChatsCommand {
    return UpdateChatsCommand;
  }
  async handle(command: UpdateChatsCommand): Promise<void> {
    await this.updater.execute(command);
  }
}
