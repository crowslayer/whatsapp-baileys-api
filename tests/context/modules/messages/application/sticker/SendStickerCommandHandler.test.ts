import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RequestFile } from '@shared/domain/RequestFile';

import { MessageError } from '@modules/messages/application/MessageError';
import { SendStickerCommand } from '@modules/messages/application/sticker/SendStickerCommand';
import { SendStickerCommandHandler } from '@modules/messages/application/sticker/SendStickerCommandHandler';
import { StickerSender } from '@modules/messages/application/sticker/StickerSender';

const INSTANCE_UUID = '0198f3a2-1b4c-7d5e-8f90-1234567890ab';

const buildFile = (): RequestFile => ({
  source: 'remote',
  url: 'https://example.com/sticker.webp',
});

describe('SendStickerCommandHandler', () => {
  let useCase: StickerSender;
  let handler: SendStickerCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    } as unknown as StickerSender;
    handler = new SendStickerCommandHandler(useCase);
  });

  it('subscribes to the SendStickerCommand', () => {
    expect(handler.subscribedTo()).toBe(SendStickerCommand);
  });

  it('executes the use case once', async () => {
    const command = new SendStickerCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile(), false);

    await expect(handler.handle(command)).rejects.toBeInstanceOf(MessageError);

    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('forwards the original command to the use case', async () => {
    const command = new SendStickerCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile(), true);

    await expect(handler.handle(command)).rejects.toBeInstanceOf(MessageError);

    expect(useCase.execute).toHaveBeenCalledWith(command);
  });

  it('resolves with undefined on the happy path', async () => {
    const command = new SendStickerCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile(), false);

    await expect(handler.handle(command)).rejects.toBeInstanceOf(MessageError);
  });

  it('propagates the use case failure', async () => {
    vi.mocked(useCase.execute).mockRejectedValue(new Error('instance not found'));
    const command = new SendStickerCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildFile(), false);

    await expect(handler.handle(command)).rejects.toThrow('instance not found');
  });
});
