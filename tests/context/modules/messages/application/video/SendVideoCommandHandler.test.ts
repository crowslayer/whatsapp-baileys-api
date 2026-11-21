import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RequestFile } from '@shared/domain/RequestFile';

import { MessageError } from '@modules/messages/application/MessageError';
import { SendVideoCommand } from '@modules/messages/application/video/SendVideoCommand';
import { SendVideoCommandHandler } from '@modules/messages/application/video/SendVideoCommandHandler';
import { VideoSender } from '@modules/messages/application/video/VideoSender';

const INSTANCE_UUID = '0198f3a2-1b4c-7d5e-8f90-1234567890ab';

const buildFile = (): RequestFile => ({
  source: 'remote',
  url: 'https://example.com/video.mp4',
});

describe('SendVideoCommandHandler', () => {
  let useCase: VideoSender;
  let handler: SendVideoCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    } as unknown as VideoSender;
    handler = new SendVideoCommandHandler(useCase);
  });

  it('subscribes to the SendVideoCommand', () => {
    expect(handler.subscribedTo()).toBe(SendVideoCommand);
  });

  it('executes the use case once', async () => {
    const command = new SendVideoCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await expect(handler.handle(command)).rejects.toBeInstanceOf(MessageError);

    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('forwards the original command to the use case', async () => {
    const command = new SendVideoCommand(
      INSTANCE_UUID,
      'to@s.whatsapp.net',
      buildFile(),
      'caption',
      true
    );

    await expect(handler.handle(command)).rejects.toBeInstanceOf(MessageError);

    expect(useCase.execute).toHaveBeenCalledWith(command);
  });

  it('resolves with undefined on the happy path', async () => {
    const command = new SendVideoCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await expect(handler.handle(command)).rejects.toBeInstanceOf(MessageError);
  });

  it('propagates the use case failure', async () => {
    vi.mocked(useCase.execute).mockRejectedValue(new Error('instance not found'));
    const command = new SendVideoCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile());

    await expect(handler.handle(command)).rejects.toThrow('instance not found');
  });
});
