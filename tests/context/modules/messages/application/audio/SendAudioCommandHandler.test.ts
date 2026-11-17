import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RequestFile } from '@shared/domain/RequestFile';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

import { AudioSender } from '@modules/messages/application/audio/AudioSender';
import { SendAudioCommand } from '@modules/messages/application/audio/SendAudioCommand';
import { SendAudioCommandHandler } from '@modules/messages/application/audio/SendAudioCommandHandler';

const INSTANCE_UUID = '0198f3a2-1b4c-7d5e-8f90-1234567890ab';

const buildFile = (): RequestFile => ({
  source: 'remote',
  url: 'https://example.com/audio.mp3',
});

const buildSentMessage = (): ISentMessage => ({
  messageId: 'message-1',
  chatId: 'chat-1',
  timestamp: new Date('2024-01-01T00:00:00.000Z'),
  senderId: INSTANCE_UUID,
  content: { messageType: 'audio', media: { storageKey: 'key' } },
});

describe('SendAudioCommandHandler', () => {
  let useCase: AudioSender;
  let handler: SendAudioCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = {
      execute: vi.fn().mockResolvedValue(buildSentMessage()),
    } as unknown as AudioSender;
    handler = new SendAudioCommandHandler(useCase);
  });

  it('subscribes to the SendAudioCommand', () => {
    expect(handler.subscribedTo()).toBe(SendAudioCommand);
  });

  it('executes the use case once', async () => {
    const command = new SendAudioCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('forwards the original command to the use case', async () => {
    const command = new SendAudioCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile(), true);

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledWith(command);
  });

  it('returns the sent message produced by the use case', async () => {
    const command = new SendAudioCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    const result = await handler.handle(command);

    expect(result).toEqual(buildSentMessage());
  });

  it('propagates the use case failure', async () => {
    vi.mocked(useCase.execute).mockRejectedValue(new Error('instance not found'));
    const command = new SendAudioCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await expect(handler.handle(command)).rejects.toThrow('instance not found');
  });
});
