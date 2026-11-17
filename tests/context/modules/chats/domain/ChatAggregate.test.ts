import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatAggregate } from '@modules/chats/domain/ChatAggregate';
import { ChatId } from '@modules/chats/domain/ChatId';
import { ChatType } from '@modules/chats/domain/ChatType';
import { InstanceId } from '@modules/instances/domain/InstanceId';

describe('ChatAggregate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a chat with its identifying data and timestamps', () => {
    // Arrange
    const before = new Date();

    // Act
    const chat = ChatAggregate.create({
      chatId: ChatId.fromString('chat-1'),
      instanceId: InstanceId.create(),
      type: ChatType.create('group'),
      name: 'Team',
      unreadCount: 2,
      isArchived: false,
      isMuted: true,
    });
    const after = new Date();

    // Assert
    expect(chat.name).toBe('Team');
    expect(chat.unreadCount).toBe(2);
    expect(chat.isGroup()).toBe(true);
    expect(chat.isIndividual()).toBe(false);
    expect(chat.createdAt.value.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(chat.updatedAt.value.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('updates only provided properties and refreshes updatedAt', () => {
    // Arrange
    const chat = ChatAggregate.create({
      chatId: ChatId.fromString('chat-1'),
      instanceId: InstanceId.create(),
      type: ChatType.create('chat'),
      name: 'Contact',
      unreadCount: 0,
      isArchived: false,
      isMuted: false,
    });
    const previousUpdatedAt = chat.updatedAt.value.getTime();

    // Act
    chat.updateFromBaileys({ name: 'Updated', unreadCount: 3, isMuted: true });

    // Assert
    expect(chat.name).toBe('Updated');
    expect(chat.unreadCount).toBe(3);
    expect(chat.isMuted).toBe(true);
    expect(chat.isArchived).toBe(false);
    expect(chat.updatedAt.value.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt);
  });
});
