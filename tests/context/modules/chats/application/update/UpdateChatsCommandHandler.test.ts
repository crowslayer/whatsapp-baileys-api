import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UpdateChatsCommandHandler } from '@modules/chats/application/update/UpdateChatsCommandHandler';
import { UpdateChatsCommand } from '@modules/chats/application/update/UpdateChatsCommand';
import { ChatsUpdater } from '@modules/chats/application/update/ChatsUpdater';

describe('UpdateChatsCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('delegates the command to its updater', async () => {
    // Arrange
    const updater = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as ChatsUpdater;
    const handler = new UpdateChatsCommandHandler(updater);
    const command = new UpdateChatsCommand('instance-1', []);

    // Act
    await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(UpdateChatsCommand);
    expect(updater.execute).toHaveBeenCalledWith(command);
  });
});
