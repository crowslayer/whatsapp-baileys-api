import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SendReactionCommandHandler } from '@modules/messages/application/reaction/SendReactionCommandHandler';
import { SendReactionCommand } from '@modules/messages/application/reaction/SendReactionCommand';
import type { ReactionSender } from '@modules/messages/application/reaction/ReactionSender';

describe('SendReactionCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('subscribes to reaction commands and delegates execution', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as ReactionSender;
    const handler = new SendReactionCommandHandler(useCase);
    const command = new SendReactionCommand('instance-1', { messageId: 'message-1', chatId: 'chat-1', fromMe: false }, '👍');

    // Act
    await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(SendReactionCommand);
    expect(useCase.execute).toHaveBeenCalledWith(command);
  });
});
