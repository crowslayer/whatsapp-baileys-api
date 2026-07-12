import { describe, expect, vi } from 'vitest';
import { SendVideoCommand } from '../../../../src/application/messages/video/SendVideoCommand';
import { SendVideoCommandHandler } from '../../../../src/application/messages/video/SendVideoCommandHandler';
import { VideoSender } from '../../../../src/application/messages/video/VideoSender';

describe('SendVideoCommand', () => {
  test('should create command with all properties', () => {
    const command = new SendVideoCommand(
      'inst-1',
      'jid1',
      Buffer.from('video-data'),
      'My caption',
      true,
      'video.mp4'
    );
    expect(command.instanceId).toBe('inst-1');
    expect(command.to).toBe('jid1');
    expect(command.caption).toBe('My caption');
    expect(command.gifPlayback).toBe(true);
    expect(command.fileName).toBe('video.mp4');
  });

  test('should create command with defaults', () => {
    const command = new SendVideoCommand('inst-1', 'jid1', Buffer.from('video-data'));
    expect(command.caption).toBeUndefined();
    expect(command.gifPlayback).toBeUndefined();
    expect(command.fileName).toBeUndefined();
  });
});

describe('VideoSender', () => {
  test('should send video successfully', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockAdapter = { messaging: { sendVideo: vi.fn() } };
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) };
    const sender = new VideoSender(mockRepo, mockRuntime);
    const command = new SendVideoCommand(
      'inst-1',
      'jid1',
      Buffer.from('video-data'),
      'Caption',
      true
    );

    await sender.execute(command);

    expect(mockAdapter.messaging.sendVideo).toHaveBeenCalledWith(
      'jid1',
      command.video,
      'Caption',
      true
    );
  });

  test('should throw when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) };
    const sender = new VideoSender(mockRepo, { get: vi.fn() });
    const command = new SendVideoCommand('inst-1', 'jid1', Buffer.from('video-data'));

    await expect(sender.execute(command)).rejects.toThrow('not found');
  });

  test('should throw when instance is not connected', async () => {
    const mockInstance = { canSendMessages: () => false };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const sender = new VideoSender(mockRepo, { get: vi.fn() });
    const command = new SendVideoCommand('inst-1', 'jid1', Buffer.from('video-data'));

    await expect(sender.execute(command)).rejects.toThrow('not connected');
  });

  test('should throw when adapter not found', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockRuntime = { get: vi.fn().mockReturnValue(null) };
    const sender = new VideoSender(mockRepo, mockRuntime);
    const command = new SendVideoCommand('inst-1', 'jid1', Buffer.from('video-data'));

    await expect(sender.execute(command)).rejects.toThrow('adapter not found');
  });
});

describe('SendVideoCommandHandler', () => {
  test('subscribedTo returns SendVideoCommand', () => {
    const handler = new SendVideoCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(SendVideoCommand);
  });

  test('handle delegates to videoSender.execute', async () => {
    const mockSender = { execute: vi.fn() };
    const handler = new SendVideoCommandHandler(mockSender);
    const command = new SendVideoCommand('inst-1', 'jid1', Buffer.from('video-data'));

    await handler.handle(command);

    expect(mockSender.execute).toHaveBeenCalledWith(command);
  });
});
