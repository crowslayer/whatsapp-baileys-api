import { describe, expect, vi } from 'vitest';
import { SendStickerCommand } from '../../../../src/application/messages/sticker/SendStickerCommand';
import { SendStickerCommandHandler } from '../../../../src/application/messages/sticker/SendStickerCommandHandler';
import { StickerSender } from '../../../../src/application/messages/sticker/StickerSender';

describe('SendStickerCommand', () => {
  test('should create command with all properties', () => {
    const sticker = Buffer.from('sticker-data');
    const command = new SendStickerCommand('inst-1', 'jid1', sticker);
    expect(command.instanceId).toBe('inst-1');
    expect(command.to).toBe('jid1');
    expect(command.sticker).toBe(sticker);
  });
});

describe('StickerSender', () => {
  test('should send sticker successfully', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockAdapter = { messaging: { sendSticker: vi.fn() } };
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) };
    const sender = new StickerSender(mockRepo, mockRuntime);
    const command = new SendStickerCommand('inst-1', 'jid1', Buffer.from('sticker-data'));

    await sender.execute(command);

    expect(mockAdapter.messaging.sendSticker).toHaveBeenCalledWith('jid1', command.sticker);
  });

  test('should throw when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) };
    const sender = new StickerSender(mockRepo, { get: vi.fn() });
    const command = new SendStickerCommand('inst-1', 'jid1', Buffer.from('sticker-data'));

    await expect(sender.execute(command)).rejects.toThrow('not found');
  });

  test('should throw when instance is not connected', async () => {
    const mockInstance = { canSendMessages: () => false };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const sender = new StickerSender(mockRepo, { get: vi.fn() });
    const command = new SendStickerCommand('inst-1', 'jid1', Buffer.from('sticker-data'));

    await expect(sender.execute(command)).rejects.toThrow('not connected');
  });

  test('should throw when adapter not found', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockRuntime = { get: vi.fn().mockReturnValue(null) };
    const sender = new StickerSender(mockRepo, mockRuntime);
    const command = new SendStickerCommand('inst-1', 'jid1', Buffer.from('sticker-data'));

    await expect(sender.execute(command)).rejects.toThrow('adapter not found');
  });
});

describe('SendStickerCommandHandler', () => {
  test('subscribedTo returns SendStickerCommand', () => {
    const handler = new SendStickerCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(SendStickerCommand);
  });

  test('handle delegates to stickerSender.execute', async () => {
    const mockSender = { execute: vi.fn() };
    const handler = new SendStickerCommandHandler(mockSender);
    const command = new SendStickerCommand('inst-1', 'jid1', Buffer.from('sticker-data'));

    await handler.handle(command);

    expect(mockSender.execute).toHaveBeenCalledWith(command);
  });
});
