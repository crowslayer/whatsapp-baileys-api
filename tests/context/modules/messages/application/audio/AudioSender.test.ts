import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@shared/domain/error/ValidationError';
import { RequestFile } from '@shared/domain/RequestFile';
import { IMessageService } from '@shared/domain/whatsapp/IMessageService';
import { IWhatsAppRuntime } from '@shared/domain/whatsapp/IWhatsAppRuntime';
import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';
import { InstanceNotFoundError } from '@modules/instances/domain/InstanceNotFoundError';
import { AudioSender } from '@modules/messages/application/audio/AudioSender';
import { SendAudioCommand } from '@modules/messages/application/audio/SendAudioCommand';
import { MessageError } from '@modules/messages/application/MessageError';

const INSTANCE_UUID = '0198f3a2-1b4c-7d5e-8f90-1234567890ab';

const buildInstance = (canSend: boolean): InstanceAggregate =>
  ({
    instanceId: INSTANCE_UUID,
    canSendMessages: vi.fn().mockReturnValue(canSend),
  }) as unknown as InstanceAggregate;

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

describe('AudioSender', () => {
  let repository: IInstanceRepository;
  let runtimeManager: IRuntimeManager;
  let messaging: IMessageService;
  let sender: AudioSender;

  beforeEach(() => {
    vi.clearAllMocks();
    messaging = {
      sendAudio: vi.fn().mockResolvedValue(buildSentMessage()),
    } as unknown as IMessageService;
    runtimeManager = {
      get: vi.fn().mockReturnValue({ messaging } as unknown as IWhatsAppRuntime),
    } as unknown as IRuntimeManager;
    repository = {
      findById: vi.fn().mockResolvedValue(buildInstance(true)),
    } as unknown as IInstanceRepository;
    sender = new AudioSender(repository, runtimeManager);
  });

  it('returns the sent message on the happy path', async () => {
    const command = new SendAudioCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    const result = await sender.execute(command);

    expect(result).toEqual(buildSentMessage());
  });

  it('sends the audio through the messaging service', async () => {
    const command = new SendAudioCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await sender.execute(command);

    expect(messaging.sendAudio).toHaveBeenCalledTimes(1);
  });

  it('forwards the recipient and the file', async () => {
    const file = buildFile();
    const command = new SendAudioCommand(INSTANCE_UUID, 'to@s.whatsapp.net', file);

    await sender.execute(command);

    expect(messaging.sendAudio).toHaveBeenCalledWith('to@s.whatsapp.net', file, false);
  });

  it('forwards the ptt flag when it is enabled', async () => {
    const file = buildFile();
    const command = new SendAudioCommand(INSTANCE_UUID, 'to@s.whatsapp.net', file, true);

    await sender.execute(command);

    expect(messaging.sendAudio).toHaveBeenCalledWith('to@s.whatsapp.net', file, true);
  });

  it('throws InstanceNotFoundError when the instance does not exist', async () => {
    vi.mocked(repository.findById).mockResolvedValue(null);
    const command = new SendAudioCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await expect(sender.execute(command)).rejects.toThrow(InstanceNotFoundError);
  });

  it('throws a ValidationError when the instance is not connected', async () => {
    vi.mocked(repository.findById).mockResolvedValue(buildInstance(false));
    const command = new SendAudioCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await expect(sender.execute(command)).rejects.toThrow(ValidationError);
  });

  it('throws a ValidationError when the adapter is not found', async () => {
    vi.mocked(runtimeManager.get).mockReturnValue(undefined as unknown as IWhatsAppRuntime);
    const command = new SendAudioCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await expect(sender.execute(command)).rejects.toThrow(/adapter not found/);
  });

  it('throws a MessageError when the messaging service returns no result', async () => {
    vi.mocked(messaging.sendAudio).mockResolvedValue(undefined);
    const command = new SendAudioCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await expect(sender.execute(command)).rejects.toThrow(MessageError);
  });

  it('throws a MessageError with the expected message when there is no result', async () => {
    vi.mocked(messaging.sendAudio).mockResolvedValue(undefined);
    const command = new SendAudioCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await expect(sender.execute(command)).rejects.toThrow('Audio message not sended');
  });

  it('propagates a messaging service failure', async () => {
    vi.mocked(messaging.sendAudio).mockRejectedValue(new Error('socket closed'));
    const command = new SendAudioCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await expect(sender.execute(command)).rejects.toThrow('socket closed');
  });
});
