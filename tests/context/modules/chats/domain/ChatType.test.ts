import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatType } from '@modules/chats/domain/ChatType';

describe('ChatType', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    { value: 'chat', group: false, individual: true },
    { value: 'group', group: true, individual: false },
  ])('creates the $value type', ({ value, group, individual }) => {
    // Arrange / Act
    const type = ChatType.create(value);

    // Assert
    expect(type.value).toBe(value);
    expect(type.toString()).toBe(value);
    expect(type.isGroup()).toBe(group);
    expect(type.isIndividual()).toBe(individual);
  });

  it.each(['', 'broadcast', 'CHAT'])('rejects unsupported type %j', (value) => {
    // Arrange / Act / Assert
    expect(() => ChatType.create(value)).toThrow('not type supported');
  });
});
