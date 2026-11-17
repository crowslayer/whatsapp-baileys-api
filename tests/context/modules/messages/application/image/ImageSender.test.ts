import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@shared/domain/error/ValidationError';
import { RequestFile } from '@shared/domain/RequestFile';
import { IMessageService } from '@shared/domain/whatsapp/IMessageService';
import { IWhatsAppRuntime } from '@shared/domain/whatsapp/IWhatsAppRuntime';
import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';
import { InstanceNotFoundError } from '@modules/instances/domain/InstanceNotFoundError';
import { ImageSender } from '@modules/messages/application/image/ImageSender';
import { SendImageCommand } from '@modules/messages/application/image/SendImageCommand';

const INSTANCE_UUID = '0198f3a2-1b4c-7d5e-8f90-1234567890ab';

const buildInstance = (canSend: boolean): InstanceAggregate =>
  ({
    instanceId: INSTANCE_UUID,
    canSendMessages: vi.fn().mockReturnValue(canSend),
  }) as unknown as InstanceAggregate;

const buildFile = (): RequestFile => ({
  source: 'remote',
  url: 'https://example.com/image.png',
});

describe('ImageSender', () => {
  let repository: IInstanceRepository;
  let runtimeManager: IRuntimeManager;
  let messaging: IMessageService;
  let sender: ImageSender;

  beforeEach(() => {
    vi.clearAllMocks();
    messaging = {
      sendImage: vi.fn().mockResolvedValue(undefined),
    } as unknown as IMessageService;
    runtimeManager = {
      get: vi.fn().mockReturnValue({ messaging } as unknown as IWhatsAppRuntime),
    } as unknown as IRuntimeManager;
    repository = {
      findById: vi.fn().mockResolvedValue(buildInstance(true)),
    } as unknown as IInstanceRepository;
    sender = new ImageSender(repository, runtimeManager);
  });

  it('sends the image through the messaging service', async () => {
    const command = new SendImageCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile(), 'caption');

    await sender.execute(command);

    expect(messaging.sendImage).toHaveBeenCalledTimes(1);
  });

  it('forwards the recipient, file and caption', async () => {
    const file = buildFile();
    const command = new SendImageCommand(INSTANCE_UUID, 'to@s.whatsapp.net', file, 'caption');

    await sender.execute(command);

    expect(messaging.sendImage).toHaveBeenCalledWith('to@s.whatsapp.net', file, 'caption');
  });

  it('forwards an undefined caption when it is not provided', async () => {
    const file = buildFile();
    const command = new SendImageCommand(INSTANCE_UUID, 'to@s.whatsapp.net', file);

    await sender.execute(command);

    expect(messaging.sendImage).toHaveBeenCalledWith('to@s.whatsapp.net', file, undefined);
  });

  it('requests the runtime for the given instance', async () => {
    const command = new SendImageCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await sender.execute(command);

    expect(runtimeManager.get).toHaveBeenCalledWith(INSTANCE_UUID);
  });

  it('throws InstanceNotFoundError when the instance does not exist', async () => {
    vi.mocked(repository.findById).mockResolvedValue(null);
    const command = new SendImageCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await expect(sender.execute(command)).rejects.toThrow(InstanceNotFoundError);
  });

  it('does not send anything when the instance does not exist', async () => {
    vi.mocked(repository.findById).mockResolvedValue(null);
    const command = new SendImageCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await expect(sender.execute(command)).rejects.toThrow();
    expect(messaging.sendImage).not.toHaveBeenCalled();
  });

  it('throws a ValidationError when the instance is not connected', async () => {
    vi.mocked(repository.findById).mockResolvedValue(buildInstance(false));
    const command = new SendImageCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await expect(sender.execute(command)).rejects.toThrow(ValidationError);
  });

  it('throws a ValidationError when the adapter is not found', async () => {
    vi.mocked(runtimeManager.get).mockReturnValue(undefined as unknown as IWhatsAppRuntime);
    const command = new SendImageCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await expect(sender.execute(command)).rejects.toThrow(/adapter not found/);
  });

  it('propagates a messaging service failure', async () => {
    vi.mocked(messaging.sendImage).mockRejectedValue(new Error('socket closed'));
    const command = new SendImageCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await expect(sender.execute(command)).rejects.toThrow('socket closed');
  });
});
