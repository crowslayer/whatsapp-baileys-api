import { describe, expect, vi } from 'vitest';
import { ImageSender } from '../../../../src/application/messages/image/ImageSender';
import { SendImageCommand } from '../../../../src/application/messages/image/SendImageCommand';

describe('ImageSender', () => {
  test('should throw when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) };
    const sender = new ImageSender(mockRepo, { get: vi.fn() });
    const command = new SendImageCommand('inst-1', 'jid1', 'data:image/png;base64,abc', 'Caption');
    await expect(sender.execute(command)).rejects.toThrow('not found');
  });

  test('should throw when instance cannot send', async () => {
    const mockInstance = { canSendMessages: () => false };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const sender = new ImageSender(mockRepo, { get: vi.fn() });
    const command = new SendImageCommand('inst-1', 'jid1', 'data:image/png;base64,abc', 'Caption');
    await expect(sender.execute(command)).rejects.toThrow('not connected');
  });

  test('should send image successfully', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockAdapter = { messaging: { sendImage: vi.fn() } };
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) };
    const sender = new ImageSender(mockRepo, mockRuntime);

    const command = new SendImageCommand(
      'inst-1',
      'jid1@s.whatsapp.net',
      'data:image/png;base64,abc',
      'Caption'
    );
    await sender.execute(command);
    expect(mockAdapter.messaging.sendImage).toHaveBeenCalled();
  });
});
