import { describe, expect, vi } from 'vitest';
import { ReactionSender } from '../../../../src/application/messages/reaction/ReactionSender';
import { SendReactionCommand } from '../../../../src/application/messages/reaction/SendReactionCommand';
import { SendReactionCommandHandler } from '../../../../src/application/messages/reaction/SendReactionCommandHandler';

import { NotFoundError } from '../../../../src/shared/infrastructure/errors/NotFoundError';
import { ValidationError } from '../../../../src/shared/infrastructure/errors/ValidationError';

const message = { chatId: 'jid1@s.whatsapp.net', messageId: 'msg123', fromMe: true };

describe('SendReactionCommand', () => {
  test('should create command with all properties', () => {
    const command = new SendReactionCommand('inst-1', message, '❤️');

    expect(command.instanceId).toBe('inst-1');
    expect(command.message).toEqual(message);
    expect(command.emoji).toBe('❤️');
  });
});

describe('ReactionSender', () => {
  test('should send reaction successfully', async () => {
    const mockInstance = { canSendMessages: vi.fn().mockReturnValue(true) };

    const mockRepository = { findById: vi.fn().mockResolvedValue(mockInstance) };

    const mockAdapter = { messaging: { sendReaction: vi.fn().mockResolvedValue(undefined) } };

    const mockRuntimeManager = { get: vi.fn().mockReturnValue(mockAdapter) };

    const sender = new ReactionSender(mockRepository as any, mockRuntimeManager as any);

    const command = new SendReactionCommand('inst-1', message, '❤️');

    await expect(sender.execute(command)).resolves.toBeUndefined();

    expect(mockRepository.findById).toHaveBeenCalledOnce();
    expect(mockRepository.findById).toHaveBeenCalledWith('inst-1');

    expect(mockInstance.canSendMessages).toHaveBeenCalledOnce();
    expect(mockRuntimeManager.get).toHaveBeenCalledWith('inst-1');

    expect(mockAdapter.messaging.sendReaction).toHaveBeenCalledOnce();
    expect(mockAdapter.messaging.sendReaction).toHaveBeenCalledWith(message.chatId, message, '❤️');
  });

  test('should throw NotFoundError when instance is not found', async () => {
    const mockRepository = { findById: vi.fn().mockResolvedValue(null) };

    const mockRuntimeManager = { get: vi.fn() };

    const sender = new ReactionSender(mockRepository as any, mockRuntimeManager as any);

    const command = new SendReactionCommand('inst-1', message, '❤️');

    let error: unknown;

    try {
      await sender.execute(command);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(NotFoundError);
    expect(error).toHaveProperty('message', 'Instance inst-1 not found');

    expect(mockRepository.findById).toHaveBeenCalledOnce();
    expect(mockRuntimeManager.get).not.toHaveBeenCalled();
  });

  test('should throw ValidationError when instance is not connected', async () => {
    const mockInstance = { canSendMessages: vi.fn().mockReturnValue(false) };

    const mockRepository = { findById: vi.fn().mockResolvedValue(mockInstance) };

    const mockRuntimeManager = { get: vi.fn() };

    const sender = new ReactionSender(mockRepository as any, mockRuntimeManager as any);

    const command = new SendReactionCommand('inst-1', message, '❤️');

    let error: unknown;

    try {
      await sender.execute(command);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toHaveProperty(
      'message',
      'Validation failed: instance: Instance inst-1 is not connected'
    );

    expect(mockInstance.canSendMessages).toHaveBeenCalledOnce();
    expect(mockRuntimeManager.get).not.toHaveBeenCalled();
  });

  test('should throw ValidationError when adapter is not found', async () => {
    const mockInstance = { canSendMessages: vi.fn().mockReturnValue(true) };

    const mockRepository = { findById: vi.fn().mockResolvedValue(mockInstance) };

    const mockRuntimeManager = { get: vi.fn().mockReturnValue(null) };

    const sender = new ReactionSender(mockRepository as any, mockRuntimeManager as any);

    const command = new SendReactionCommand('inst-1', message, '❤️');

    let error: unknown;

    try {
      await sender.execute(command);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toHaveProperty(
      'message',
      'Validation failed: instance: Instance inst-1 adapter not found'
    );

    expect(mockRuntimeManager.get).toHaveBeenCalledWith('inst-1');
  });

  test('should propagate errors from sendReaction', async () => {
    const mockInstance = { canSendMessages: vi.fn().mockReturnValue(true) };

    const mockRepository = { findById: vi.fn().mockResolvedValue(mockInstance) };

    const mockAdapter = {
      messaging: { sendReaction: vi.fn().mockRejectedValue(new Error('WhatsApp failure')) },
    };

    const mockRuntimeManager = { get: vi.fn().mockReturnValue(mockAdapter) };

    const sender = new ReactionSender(mockRepository as any, mockRuntimeManager as any);

    const command = new SendReactionCommand('inst-1', message, '❤️');

    await expect(sender.execute(command)).rejects.toThrow('WhatsApp failure');

    expect(mockAdapter.messaging.sendReaction).toHaveBeenCalledOnce();
  });
});

describe('SendReactionCommandHandler', () => {
  test('subscribedTo returns SendReactionCommand', () => {
    const handler = new SendReactionCommandHandler({ execute: vi.fn() } as any);

    expect(handler.subscribedTo()).toBe(SendReactionCommand);
  });

  test('handle delegates to reactionSender.execute', async () => {
    const mockSender = { execute: vi.fn().mockResolvedValue(undefined) };

    const handler = new SendReactionCommandHandler(mockSender as any);

    const command = new SendReactionCommand('inst-1', message, '❤️');

    await handler.handle(command);

    expect(mockSender.execute).toHaveBeenCalledOnce();
    expect(mockSender.execute).toHaveBeenCalledWith(command);
  });
});
