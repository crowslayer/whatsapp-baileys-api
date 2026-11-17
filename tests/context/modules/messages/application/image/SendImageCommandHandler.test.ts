import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RequestFile } from '@shared/domain/RequestFile';

import { ImageSender } from '@modules/messages/application/image/ImageSender';
import { SendImageCommand } from '@modules/messages/application/image/SendImageCommand';
import { SendImageCommandHandler } from '@modules/messages/application/image/SendImageCommandHandler';

const INSTANCE_UUID = '0198f3a2-1b4c-7d5e-8f90-1234567890ab';

const buildFile = (): RequestFile => ({
  source: 'remote',
  url: 'https://example.com/image.png',
});

describe('SendImageCommandHandler', () => {
  let useCase: ImageSender;
  let handler: SendImageCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    } as unknown as ImageSender;
    handler = new SendImageCommandHandler(useCase);
  });

  it('subscribes to the SendImageCommand', () => {
    expect(handler.subscribedTo()).toBe(SendImageCommand);
  });

  it('executes the use case once', async () => {
    const command = new SendImageCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('forwards the original command to the use case', async () => {
    const command = new SendImageCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile(), 'caption');

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledWith(command);
  });

  it('forwards a command without caption', async () => {
    const command = new SendImageCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledWith(command);
  });

  it('propagates the use case failure', async () => {
    vi.mocked(useCase.execute).mockRejectedValue(new Error('instance not found'));
    const command = new SendImageCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await expect(handler.handle(command)).rejects.toThrow('instance not found');
  });
});
