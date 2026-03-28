import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { ChatSynchronizer } from './ChatSynchronizer';
import { SyncChatsCommand } from './SyncChatsCommand';

export class SyncChatsCommandHandler implements ICommandHandler<SyncChatsCommand> {
  constructor(private readonly sinchronizer: ChatSynchronizer) {}

  subscribedTo(): typeof SyncChatsCommand {
    return SyncChatsCommand;
  }

  async handle(command: SyncChatsCommand): Promise<void> {
    return await this.sinchronizer.execute(command);
  }
}
