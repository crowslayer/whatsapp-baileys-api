import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatId } from '@modules/chats/domain/ChatId';

describe('ChatId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('trims values and compares identifiers by value', () => {
    // Arrange
    const first = ChatId.fromString('  chat-1  ');
    const equal = ChatId.fromString('chat-1');
    const other = ChatId.fromString('chat-2');

    // Act
    const actualValue = first.value;

    // Assert
    expect(actualValue).toBe('chat-1');
    expect(first.equals(equal)).toBe(true);
    expect(first.equals(other)).toBe(false);
    expect(first.toString()).toBe('chat-1');
  });

  it.each(['', '   '])('rejects an empty identifier (%j)', (value) => {
    // Arrange / Act / Assert
    expect(() => ChatId.fromString(value)).toThrow('ChatId cannot be empty.');
  });
});
