import { describe, expect, vi } from 'vitest';
import { AudioSender } from '../../../../src/application/messages/audio/AudioSender';
import { SendAudioCommand } from '../../../../src/application/messages/audio/SendAudioCommand';
import { SendAudioCommandHandler } from '../../../../src/application/messages/audio/SendAudioCommandHandler';

describe('SendAudioCommand', () => {
  test('should create command with all properties', () => {
    const command = new SendAudioCommand(
      'inst-1',
      'jid1',
      Buffer.from('audio-data'),
      true,
      'audio/ogg'
    );
    expect(command.instanceId).toBe('inst-1');
    expect(command.to).toBe('jid1');
    expect(command.ptt).toBe(true);
    expect(command.mimetype).toBe('audio/ogg');
  });

  test('should create command with defaults', () => {
    const command = new SendAudioCommand('inst-1', 'jid1', {
      url: 'https://example.com/audio.ogg',
    });
    expect(command.ptt).toBeUndefined();
    expect(command.mimetype).toBeUndefined();
  });
});

describe('AudioSender', () => {
  test('should send audio successfully', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockAdapter = { messaging: { sendAudio: vi.fn() } };
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) };
    const sender = new AudioSender(mockRepo, mockRuntime);
    const command = new SendAudioCommand(
      'inst-1',
      'jid1',
      Buffer.from('audio-data'),
      true,
      'audio/ogg'
    );

    await sender.execute(command);

    expect(mockAdapter.messaging.sendAudio).toHaveBeenCalledWith(
      'jid1',
      command.audio,
      true,
      'audio/ogg'
    );
  });

  test('should use defaults for ptt and mimetype', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockAdapter = { messaging: { sendAudio: vi.fn() } };
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) };
    const sender = new AudioSender(mockRepo, mockRuntime);
    const command = new SendAudioCommand('inst-1', 'jid1', Buffer.from('audio-data'));

    await sender.execute(command);

    expect(mockAdapter.messaging.sendAudio).toHaveBeenCalledWith('jid1', command.audio, false, '');
  });

  test('should throw when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) };
    const sender = new AudioSender(mockRepo, { get: vi.fn() });
    const command = new SendAudioCommand('inst-1', 'jid1', Buffer.from('audio-data'));

    await expect(sender.execute(command)).rejects.toThrow('not found');
  });

  test('should throw when instance is not connected', async () => {
    const mockInstance = { canSendMessages: () => false };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const sender = new AudioSender(mockRepo, { get: vi.fn() });
    const command = new SendAudioCommand('inst-1', 'jid1', Buffer.from('audio-data'));

    await expect(sender.execute(command)).rejects.toThrow('not connected');
  });

  test('should throw when adapter not found', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockRuntime = { get: vi.fn().mockReturnValue(null) };
    const sender = new AudioSender(mockRepo, mockRuntime);
    const command = new SendAudioCommand('inst-1', 'jid1', Buffer.from('audio-data'));

    await expect(sender.execute(command)).rejects.toThrow('adapter not found');
  });
});

describe('SendAudioCommandHandler', () => {
  test('subscribedTo returns SendAudioCommand', () => {
    const handler = new SendAudioCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(SendAudioCommand);
  });

  test('handle delegates to sender.execute', async () => {
    const mockSender = { execute: vi.fn() };
    const handler = new SendAudioCommandHandler(mockSender);
    const command = new SendAudioCommand('inst-1', 'jid1', Buffer.from('audio-data'));

    await handler.handle(command);

    expect(mockSender.execute).toHaveBeenCalledWith(command);
  });
});
