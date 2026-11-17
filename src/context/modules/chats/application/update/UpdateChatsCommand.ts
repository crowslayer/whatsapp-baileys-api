import { Command } from '@shared/domain/command/Command';

import { IChat } from '@modules/chats/domain/IChat';

export class UpdateChatsCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly updates: Array<Partial<IChat> & { chatId: string }>
  ) {
    super();
  }
}
