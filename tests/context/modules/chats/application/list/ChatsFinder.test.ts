import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatsFinder } from '@modules/chats/application/list/ChatsFinder';
import { GetChatsQuery } from '@modules/chats/application/list/GetChatsQuery';
import type { IChatReadRepository } from '@modules/chats/domain/IChatReadRepository';

describe('ChatsFinder', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns chats and their count', async () => {
    // Arrange
    const chats = [{ chatId: 'chat-1', instanceId: 'i1', name: 'Alice', type: 'chat' as const, unreadCount: 0, isArchived: false, isMuted: false }];
    const repository = { findChatsByInstance: vi.fn().mockResolvedValue(chats) } as unknown as IChatReadRepository;
    const finder = new ChatsFinder(repository);
    const query = new GetChatsQuery('instance-1');

    // Act
    const result = await finder.execute(query);

    // Assert
    expect(result).toEqual({ chats, chatsCount: 1 });
    expect(repository.findChatsByInstance).toHaveBeenCalledWith('instance-1');
  });
});
