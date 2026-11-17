import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ReactionSender } from '@modules/messages/application/reaction/ReactionSender';
import { SendReactionCommand } from '@modules/messages/application/reaction/SendReactionCommand';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import type { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

describe('ReactionSender', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('sends a reaction using the connected instance runtime', async () => {
    // Arrange
    const repository = { findById: vi.fn().mockResolvedValue({ canSendMessages: () => true }) } as unknown as IInstanceRepository;
    const sendReaction = vi.fn().mockResolvedValue(undefined);
    const runtimeManager = { get: vi.fn().mockReturnValue({ messaging: { sendReaction } }) } as unknown as IRuntimeManager;
    const message = { messageId: 'message-1', chatId: 'chat-1', fromMe: false };
    const command = new SendReactionCommand('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', message, '👍');

    // Act
    await new ReactionSender(repository, runtimeManager).execute(command);

    // Assert
    expect(sendReaction).toHaveBeenCalledWith('chat-1', message, '👍');
  });

  it('rejects when the instance is disconnected', async () => {
    // Arrange
    const repository = { findById: vi.fn().mockResolvedValue({ canSendMessages: () => false }) } as unknown as IInstanceRepository;
    const runtimeManager = { get: vi.fn() } as unknown as IRuntimeManager;
    const command = new SendReactionCommand('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', {
      messageId: 'message-1', chatId: 'chat-1', fromMe: false,
    }, '👍');

    // Act / Assert
    await expect(new ReactionSender(repository, runtimeManager).execute(command)).rejects.toThrow('not connected');
  });
});
