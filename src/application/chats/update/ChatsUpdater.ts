import { IChatRepository } from '@domain/repositories/IChatRepository';

import { UpdateChatsCommand } from './UpdateChatsCommand';

export class ChatsUpdater {
  constructor(private readonly _chatRepository: IChatRepository) {}

  async execute(command: UpdateChatsCommand): Promise<void> {
    for (const update of command.updates) {
      const existing = await this._chatRepository.findById(update.chatId, command.instanceId);
      if (!existing) continue;

      existing.updateFromBaileys({
        ...(update.unreadCount !== undefined && { unreadCount: update.unreadCount }),
        ...(update.lastMessageTimestamp !== undefined && {
          lastMessageTimestamp: update.lastMessageTimestamp,
        }),
        ...(update.isArchived !== undefined && { isArchived: update.isArchived }),
        ...(update.isMuted !== undefined && { isMuted: update.isMuted }),
      });

      await this._chatRepository.update(existing);
    }
  }
}
