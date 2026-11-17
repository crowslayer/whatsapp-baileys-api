import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatsUpdater } from '@modules/chats/application/update/ChatsUpdater';
import { UpdateChatsCommand } from '@modules/chats/application/update/UpdateChatsCommand';
import type { IChatRepository } from '@modules/chats/domain/IChatRepository';

describe('ChatsUpdater', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('updates existing chats and skips missing chats', async () => {
    // Arrange
    const existing = { updateFromBaileys: vi.fn() };
    const repository = {
      findById: vi.fn().mockResolvedValueOnce(existing).mockResolvedValueOnce(null),
      update: vi.fn().mockResolvedValue(undefined),
    } as unknown as IChatRepository;
    const updater = new ChatsUpdater(repository);
    const command = new UpdateChatsCommand('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', [
      { chatId: 'chat-1', unreadCount: 4 },
      { chatId: 'chat-2', isMuted: true },
    ]);

    // Act
    await updater.execute(command);

    // Assert
    expect(existing.updateFromBaileys).toHaveBeenCalledWith({ unreadCount: 4 });
    expect(repository.update).toHaveBeenCalledOnce();
  });
});
