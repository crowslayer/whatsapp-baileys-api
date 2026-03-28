import { IBaileysChat } from '@infrastructure/baileys/IBaileysChat';

import { Command } from '@shared/domain/commands/Command';

export class SyncChatsCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly chats: IBaileysChat[],
    /**
     * When true, deletes all existing chats for the instance before
     * re-syncing. Useful for a full refresh. Default: false (upsert only).
     */
    public readonly fullRefresh: boolean = false
  ) {
    super();
  }
}
