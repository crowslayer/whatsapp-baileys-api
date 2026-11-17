import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatsResponse } from '@modules/chats/application/list/ChatsResponse';

describe('ChatsResponse', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('wraps chat results and count', () => {
    // Arrange
    const result = { chats: [], chatsCount: 0 };

    // Act
    const response = ChatsResponse.create(result);

    // Assert
    expect(response.content).toBe(result);
  });

  it('returns the default empty result for null input', () => {
    // Arrange / Act
    const response = ChatsResponse.create(null as never);

    // Assert
    expect(response.content).toEqual({ chats: [], chatsCount: 0 });
  });
});
