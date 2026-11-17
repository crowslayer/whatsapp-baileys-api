import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@shared/domain/error/ValidationError';
import { IMessageService } from '@shared/domain/whatsapp/IMessageService';
import { IWhatsAppRuntime } from '@shared/domain/whatsapp/IWhatsAppRuntime';
import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';
import { InstanceNotFoundError } from '@modules/instances/domain/InstanceNotFoundError';
import { LocationSender } from '@modules/messages/application/location/LocationSender';
import { SendLocationCommand } from '@modules/messages/application/location/SendLocationCommand';

const INSTANCE_UUID = '0198f3a2-1b4c-7d5e-8f90-1234567890ab';

const buildInstance = (canSend: boolean): InstanceAggregate =>
  ({
    instanceId: INSTANCE_UUID,
    canSendMessages: vi.fn().mockReturnValue(canSend),
  }) as unknown as InstanceAggregate;

describe('LocationSender', () => {
  let repository: IInstanceRepository;
  let runtimeManager: IRuntimeManager;
  let messaging: IMessageService;
  let sender: LocationSender;

  beforeEach(() => {
    vi.clearAllMocks();
    messaging = {
      sendLocation: vi.fn().mockResolvedValue(undefined),
    } as unknown as IMessageService;
    runtimeManager = {
      get: vi.fn().mockReturnValue({ messaging } as unknown as IWhatsAppRuntime),
    } as unknown as IRuntimeManager;
    repository = {
      findById: vi.fn().mockResolvedValue(buildInstance(true)),
    } as unknown as IInstanceRepository;
    sender = new LocationSender(repository, runtimeManager);
  });

  it('sends the location through the messaging service', async () => {
    const command = new SendLocationCommand(INSTANCE_UUID, 'to@s.whatsapp.net', 19.4326, -99.1332);

    await sender.execute(command);

    expect(messaging.sendLocation).toHaveBeenCalledTimes(1);
  });

  it('forwards the coordinates, name and address', async () => {
    const command = new SendLocationCommand(
      INSTANCE_UUID,
      'to@s.whatsapp.net',
      19.4326,
      -99.1332,
      'Zocalo',
      'Centro'
    );

    await sender.execute(command);

    expect(messaging.sendLocation).toHaveBeenCalledWith(
      'to@s.whatsapp.net',
      19.4326,
      -99.1332,
      'Zocalo',
      'Centro'
    );
  });

  it('forwards undefined name and address when they are not provided', async () => {
    const command = new SendLocationCommand(INSTANCE_UUID, 'to@s.whatsapp.net', 0, 0);

    await sender.execute(command);

    expect(messaging.sendLocation).toHaveBeenCalledWith(
      'to@s.whatsapp.net',
      0,
      0,
      undefined,
      undefined
    );
  });

  it('requests the runtime for the given instance', async () => {
    const command = new SendLocationCommand(INSTANCE_UUID, 'to@s.whatsapp.net', 1, 2);

    await sender.execute(command);

    expect(runtimeManager.get).toHaveBeenCalledWith(INSTANCE_UUID);
  });

  it('throws InstanceNotFoundError when the instance does not exist', async () => {
    vi.mocked(repository.findById).mockResolvedValue(null);
    const command = new SendLocationCommand(INSTANCE_UUID, 'to@s.whatsapp.net', 1, 2);

    await expect(sender.execute(command)).rejects.toThrow(InstanceNotFoundError);
  });

  it('does not send anything when the instance does not exist', async () => {
    vi.mocked(repository.findById).mockResolvedValue(null);
    const command = new SendLocationCommand(INSTANCE_UUID, 'to@s.whatsapp.net', 1, 2);

    await expect(sender.execute(command)).rejects.toThrow();
    expect(messaging.sendLocation).not.toHaveBeenCalled();
  });

  it('throws a ValidationError when the instance is not connected', async () => {
    vi.mocked(repository.findById).mockResolvedValue(buildInstance(false));
    const command = new SendLocationCommand(INSTANCE_UUID, 'to@s.whatsapp.net', 1, 2);

    await expect(sender.execute(command)).rejects.toThrow(ValidationError);
  });

  it('throws a ValidationError when the adapter is not found', async () => {
    vi.mocked(runtimeManager.get).mockReturnValue(undefined as unknown as IWhatsAppRuntime);
    const command = new SendLocationCommand(INSTANCE_UUID, 'to@s.whatsapp.net', 1, 2);

    await expect(sender.execute(command)).rejects.toThrow(/adapter not found/);
  });

  it('propagates a messaging service failure', async () => {
    vi.mocked(messaging.sendLocation).mockRejectedValue(new Error('socket closed'));
    const command = new SendLocationCommand(INSTANCE_UUID, 'to@s.whatsapp.net', 1, 2);

    await expect(sender.execute(command)).rejects.toThrow('socket closed');
  });
});
