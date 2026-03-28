import { IBaileysChat } from '@infrastructure/baileys/IBaileysChat';

import { Command } from '@shared/domain/commands/Command';

export class UpdateChatsCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly updates: Array<Partial<IBaileysChat> & { chatId: string }>
  ) {
    super();
  }
}
