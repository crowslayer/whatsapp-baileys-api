import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

import { ContactSender } from '@modules/messages/application/contact/ContactSender';
import { SendContactCommand } from '@modules/messages/application/contact/SendContactCommand';
import { SendContactCommandHandler } from '@modules/messages/application/contact/SendContactCommandHandler';

const INSTANCE_UUID = '0198f3a2-1b4c-7d5e-8f90-1234567890ab';

const buildContacts = (): Array<{ displayName: string; vcard: string }> => [
  { displayName: 'John Doe', vcard: 'BEGIN:VCARD\nVERSION:3.0\nEND:VCARD' },
];

const buildSentMessage = (): ISentMessage => ({
  messageId: 'message-1',
  chatId: 'chat-1',
  timestamp: new Date('2024-01-01T00:00:00.000Z'),
  senderId: INSTANCE_UUID,
  content: { messageType: 'contact', contacts: buildContacts() },
});

describe('SendContactCommandHandler', () => {
  let useCase: ContactSender;
  let handler: SendContactCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = {
      execute: vi.fn().mockResolvedValue(buildSentMessage()),
    } as unknown as ContactSender;
    handler = new SendContactCommandHandler(useCase);
  });

  it('subscribes to the SendContactCommand', () => {
    expect(handler.subscribedTo()).toBe(SendContactCommand);
  });

  it('executes the use case once', async () => {
    const command = new SendContactCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildContacts());

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('forwards the original command to the use case', async () => {
    const command = new SendContactCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildContacts());

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledWith(command);
  });

  it('returns the sent message produced by the use case', async () => {
    const command = new SendContactCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildContacts());

    const result = await handler.handle(command);

    expect(result).toEqual(buildSentMessage());
  });

  it('propagates the use case failure', async () => {
    vi.mocked(useCase.execute).mockRejectedValue(new Error('instance not found'));
    const command = new SendContactCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildContacts());

    await expect(handler.handle(command)).rejects.toThrow('instance not found');
  });
});
