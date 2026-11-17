import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@shared/domain/error/ValidationError';
import { IMessageService } from '@shared/domain/whatsapp/IMessageService';
import { IWhatsAppRuntime } from '@shared/domain/whatsapp/IWhatsAppRuntime';
import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';
import { InstanceNotFoundError } from '@modules/instances/domain/InstanceNotFoundError';
import { ContactSender } from '@modules/messages/application/contact/ContactSender';
import { SendContactCommand } from '@modules/messages/application/contact/SendContactCommand';
import { MessageError } from '@modules/messages/application/MessageError';

const INSTANCE_UUID = '0198f3a2-1b4c-7d5e-8f90-1234567890ab';

const buildInstance = (canSend: boolean): InstanceAggregate =>
  ({
    instanceId: INSTANCE_UUID,
    canSendMessages: vi.fn().mockReturnValue(canSend),
  }) as unknown as InstanceAggregate;

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

describe('ContactSender', () => {
  let repository: IInstanceRepository;
  let runtimeManager: IRuntimeManager;
  let messaging: IMessageService;
  let sender: ContactSender;

  beforeEach(() => {
    vi.clearAllMocks();
    messaging = {
      sendContact: vi.fn().mockResolvedValue(buildSentMessage()),
    } as unknown as IMessageService;
    runtimeManager = {
      get: vi.fn().mockReturnValue({ messaging } as unknown as IWhatsAppRuntime),
    } as unknown as IRuntimeManager;
    repository = {
      findById: vi.fn().mockResolvedValue(buildInstance(true)),
    } as unknown as IInstanceRepository;
    sender = new ContactSender(repository, runtimeManager);
  });

  it('returns the sent message on the happy path', async () => {
    const command = new SendContactCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildContacts());

    const result = await sender.execute(command);

    expect(result).toEqual(buildSentMessage());
  });

  it('forwards the recipient and the contacts', async () => {
    const contacts = buildContacts();
    const command = new SendContactCommand(INSTANCE_UUID, 'to@s.whatsapp.net', contacts);

    await sender.execute(command);

    expect(messaging.sendContact).toHaveBeenCalledWith('to@s.whatsapp.net', contacts);
  });

  it('forwards an empty contacts list', async () => {
    const command = new SendContactCommand(INSTANCE_UUID, 'to@s.whatsapp.net', []);

    await sender.execute(command);

    expect(messaging.sendContact).toHaveBeenCalledWith('to@s.whatsapp.net', []);
  });

  it('throws InstanceNotFoundError when the instance does not exist', async () => {
    vi.mocked(repository.findById).mockResolvedValue(null);
    const command = new SendContactCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildContacts());

    await expect(sender.execute(command)).rejects.toThrow(InstanceNotFoundError);
  });

  it('throws a ValidationError when the instance is not connected', async () => {
    vi.mocked(repository.findById).mockResolvedValue(buildInstance(false));
    const command = new SendContactCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildContacts());

    await expect(sender.execute(command)).rejects.toThrow(ValidationError);
  });

  it('throws a ValidationError when the adapter is not found', async () => {
    vi.mocked(runtimeManager.get).mockReturnValue(undefined as unknown as IWhatsAppRuntime);
    const command = new SendContactCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildContacts());

    await expect(sender.execute(command)).rejects.toThrow(/adapter not found/);
  });

  it('throws a MessageError when the messaging service returns no result', async () => {
    vi.mocked(messaging.sendContact).mockResolvedValue(undefined);
    const command = new SendContactCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildContacts());

    await expect(sender.execute(command)).rejects.toThrow(MessageError);
  });

  it('throws a MessageError with the expected message when there is no result', async () => {
    vi.mocked(messaging.sendContact).mockResolvedValue(undefined);
    const command = new SendContactCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildContacts());

    await expect(sender.execute(command)).rejects.toThrow('Contact not sender');
  });

  it('propagates a messaging service failure', async () => {
    vi.mocked(messaging.sendContact).mockRejectedValue(new Error('socket closed'));
    const command = new SendContactCommand(INSTANCE_UUID, 'to@s.whatsapp.net', buildContacts());

    await expect(sender.execute(command)).rejects.toThrow('socket closed');
  });
});
