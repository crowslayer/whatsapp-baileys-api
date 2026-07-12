import { describe, expect, vi } from 'vitest';
import { ContactSender } from '../../../../src/application/messages/contact/ContactSender';
import { SendContactCommand } from '../../../../src/application/messages/contact/SendContactCommand';
import { SendContactCommandHandler } from '../../../../src/application/messages/contact/SendContactCommandHandler';

describe('SendContactCommand', () => {
  test('should create command with all properties', () => {
    const contacts = [{ displayName: 'John', vcard: 'BEGIN:VCARD...' }];
    const command = new SendContactCommand('inst-1', 'jid1', contacts);
    expect(command.instanceId).toBe('inst-1');
    expect(command.to).toBe('jid1');
    expect(command.contacts).toEqual(contacts);
  });
});

describe('ContactSender', () => {
  test('should send contact successfully', async () => {
    const contacts = [{ displayName: 'John', vcard: 'BEGIN:VCARD...' }];
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockAdapter = { messaging: { sendContact: vi.fn() } };
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) };
    const sender = new ContactSender(mockRepo, mockRuntime);
    const command = new SendContactCommand('inst-1', 'jid1', contacts);

    await sender.execute(command);

    expect(mockAdapter.messaging.sendContact).toHaveBeenCalledWith('jid1', contacts);
  });

  test('should throw when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) };
    const sender = new ContactSender(mockRepo, { get: vi.fn() });
    const command = new SendContactCommand('inst-1', 'jid1', []);

    await expect(sender.execute(command)).rejects.toThrow('not found');
  });

  test('should throw when instance is not connected', async () => {
    const mockInstance = { canSendMessages: () => false };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const sender = new ContactSender(mockRepo, { get: vi.fn() });
    const command = new SendContactCommand('inst-1', 'jid1', []);

    await expect(sender.execute(command)).rejects.toThrow('not connected');
  });

  test('should throw when adapter not found', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockRuntime = { get: vi.fn().mockReturnValue(null) };
    const sender = new ContactSender(mockRepo, mockRuntime);
    const command = new SendContactCommand('inst-1', 'jid1', []);

    await expect(sender.execute(command)).rejects.toThrow('adapter not found');
  });
});

describe('SendContactCommandHandler', () => {
  test('subscribedTo returns SendContactCommand', () => {
    const handler = new SendContactCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(SendContactCommand);
  });

  test('handle delegates to sender.execute', async () => {
    const mockSender = { execute: vi.fn() };
    const handler = new SendContactCommandHandler(mockSender);
    const command = new SendContactCommand('inst-1', 'jid1', [
      { displayName: 'John', vcard: '...' },
    ]);

    await handler.handle(command);

    expect(mockSender.execute).toHaveBeenCalledWith(command);
  });
});
