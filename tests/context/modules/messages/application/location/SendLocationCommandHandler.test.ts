import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LocationSender } from '@modules/messages/application/location/LocationSender';
import { SendLocationCommand } from '@modules/messages/application/location/SendLocationCommand';
import { SendLocationCommandHandler } from '@modules/messages/application/location/SendLocationCommandHandler';

const INSTANCE_UUID = '0198f3a2-1b4c-7d5e-8f90-1234567890ab';

describe('SendLocationCommandHandler', () => {
  let useCase: LocationSender;
  let handler: SendLocationCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    } as unknown as LocationSender;
    handler = new SendLocationCommandHandler(useCase);
  });

  it('subscribes to the SendLocationCommand', () => {
    expect(handler.subscribedTo()).toBe(SendLocationCommand);
  });

  it('executes the use case once', async () => {
    const command = new SendLocationCommand(INSTANCE_UUID, 'to@s.whatsapp.net', 1, 2);

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('forwards the original command to the use case', async () => {
    const command = new SendLocationCommand(INSTANCE_UUID, 'to@s.whatsapp.net', 1, 2, 'name', 'addr');

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledWith(command);
  });

  it('resolves with undefined on the happy path', async () => {
    const command = new SendLocationCommand(INSTANCE_UUID, 'to@s.whatsapp.net', 1, 2);

    await expect(handler.handle(command)).resolves.toBeUndefined();
  });

  it('propagates the use case failure', async () => {
    vi.mocked(useCase.execute).mockRejectedValue(new Error('instance not found'));
    const command = new SendLocationCommand(INSTANCE_UUID, 'to@s.whatsapp.net', 1, 2);

    await expect(handler.handle(command)).rejects.toThrow('instance not found');
  });
});
