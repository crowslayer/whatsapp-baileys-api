import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GetChatsQueryHandler } from '@modules/chats/application/list/GetChatsQueryHandler';
import { ChatsFinder } from '@modules/chats/application/list/ChatsFinder';
import { GetChatsQuery } from '@modules/chats/application/list/GetChatsQuery';

describe('GetChatsQueryHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('wraps finder data in a ChatsResponse', async () => {
    // Arrange
    const finder = { execute: vi.fn().mockResolvedValue({ chats: [], chatsCount: 0 }) } as unknown as ChatsFinder;
    const handler = new GetChatsQueryHandler(finder);
    const query = new GetChatsQuery('instance-1');

    // Act
    const result = await handler.handle(query);

    // Assert
    expect(handler.subscribedTo()).toBe(GetChatsQuery);
    expect(result.content.chats).toEqual([]);
    expect(result.content.chatsCount).toBe(0);
  });
});
