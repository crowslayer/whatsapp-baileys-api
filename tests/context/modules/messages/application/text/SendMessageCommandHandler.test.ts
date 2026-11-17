import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SendMessageCommand } from '@modules/messages/application/text/SendMessageCommand';
import { SendMessageCommandHandler } from '@modules/messages/application/text/SendMessageCommandHandler';
import { TextMessageSender } from '@modules/messages/application/text/TextMessageSender';

const INSTANCE_UUID = '0198f3a2-1b4c-7d5e-8f90-1234567890ab';
const RAW_PHONE = '5512345678';
const EXPECTED_JID = '5215512345678@s.whatsapp.net';

describe('SendMessageCommandHandler', () => {
  let useCase: TextMessageSender;
  let handler: SendMessageCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    } as unknown as TextMessageSender;
    handler = new SendMessageCommandHandler(useCase);
  });

  it('subscribes to the SendMessageCommand', () => {
    expect(handler.subscribedTo()).toBe(SendMessageCommand);
  });

  it('executes the use case once', async () => {
    const command = new SendMessageCommand(INSTANCE_UUID, RAW_PHONE, 'hello');

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('normalizes the phone number into a jid', async () => {
    const command = new SendMessageCommand(INSTANCE_UUID, RAW_PHONE, 'hello');

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledWith({
      instanceId: INSTANCE_UUID,
      jid: EXPECTED_JID,
      message: 'hello',
    });
  });

  it('keeps an already formatted jid untouched', async () => {
    const command = new SendMessageCommand(INSTANCE_UUID, EXPECTED_JID, 'hello');

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledWith({
      instanceId: INSTANCE_UUID,
      jid: EXPECTED_JID,
      message: 'hello',
    });
  });

  it('keeps a group jid untouched', async () => {
    const command = new SendMessageCommand(INSTANCE_UUID, '1234567890@g.us', 'hello');

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledWith({
      instanceId: INSTANCE_UUID,
      jid: '1234567890@g.us',
      message: 'hello',
    });
  });

  it('sends an empty message body', async () => {
    const command = new SendMessageCommand(INSTANCE_UUID, RAW_PHONE, '');

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledWith({
      instanceId: INSTANCE_UUID,
      jid: EXPECTED_JID,
      message: '',
    });
  });

  it('throws when the phone number is invalid', async () => {
    const command = new SendMessageCommand(INSTANCE_UUID, 'not-a-phone', 'hello');

    await expect(handler.handle(command)).rejects.toThrow('Phone invalid');
  });

  it('does not execute the use case when the phone number is invalid', async () => {
    const command = new SendMessageCommand(INSTANCE_UUID, 'not-a-phone', 'hello');

    await expect(handler.handle(command)).rejects.toThrow();
    expect(useCase.execute).not.toHaveBeenCalled();
  });

  it('propagates the use case failure', async () => {
    vi.mocked(useCase.execute).mockRejectedValue(new Error('instance not found'));
    const command = new SendMessageCommand(INSTANCE_UUID, RAW_PHONE, 'hello');

    await expect(handler.handle(command)).rejects.toThrow('instance not found');
  });
});
