import { describe, expect, vi } from 'vitest';
import { DocumentSender } from '../../../../src/application/messages/document/DocumentSender';
import { SendDocumentCommand } from '../../../../src/application/messages/document/SendDocumentCommand';
import { SendDocumentCommandHandler } from '../../../../src/application/messages/document/SendDocumentCommandHandler';

describe('SendDocumentCommand', () => {
  test('should create command with all properties', () => {
    const command = new SendDocumentCommand(
      'inst-1',
      'jid1',
      Buffer.from('doc-data'),
      'file.pdf',
      'application/pdf',
      'My doc'
    );
    expect(command.instanceId).toBe('inst-1');
    expect(command.to).toBe('jid1');
    expect(command.fileName).toBe('file.pdf');
    expect(command.mimetype).toBe('application/pdf');
    expect(command.caption).toBe('My doc');
  });

  test('should create command without caption', () => {
    const command = new SendDocumentCommand(
      'inst-1',
      'jid1',
      Buffer.from('doc-data'),
      'file.pdf',
      'application/pdf'
    );
    expect(command.caption).toBeUndefined();
  });
});

describe('DocumentSender', () => {
  test('should send document successfully', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockAdapter = { messaging: { sendDocument: vi.fn() } };
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) };
    const sender = new DocumentSender(mockRepo, mockRuntime);
    const command = new SendDocumentCommand(
      'inst-1',
      'jid1',
      Buffer.from('doc-data'),
      'file.pdf',
      'application/pdf',
      'Caption'
    );

    await sender.execute(command);

    expect(mockAdapter.messaging.sendDocument).toHaveBeenCalledWith(
      'jid1',
      command.document,
      'file.pdf',
      'application/pdf',
      'Caption'
    );
  });

  test('should throw when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) };
    const sender = new DocumentSender(mockRepo, { get: vi.fn() });
    const command = new SendDocumentCommand(
      'inst-1',
      'jid1',
      Buffer.from('doc-data'),
      'f.pdf',
      'application/pdf'
    );

    await expect(sender.execute(command)).rejects.toThrow('not found');
  });

  test('should throw when instance is not connected', async () => {
    const mockInstance = { canSendMessages: () => false };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const sender = new DocumentSender(mockRepo, { get: vi.fn() });
    const command = new SendDocumentCommand(
      'inst-1',
      'jid1',
      Buffer.from('doc-data'),
      'f.pdf',
      'application/pdf'
    );

    await expect(sender.execute(command)).rejects.toThrow('not connected');
  });

  test('should throw when adapter not found', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockRuntime = { get: vi.fn().mockReturnValue(null) };
    const sender = new DocumentSender(mockRepo, mockRuntime);
    const command = new SendDocumentCommand(
      'inst-1',
      'jid1',
      Buffer.from('doc-data'),
      'f.pdf',
      'application/pdf'
    );

    await expect(sender.execute(command)).rejects.toThrow('adapter not found');
  });
});

describe('SendDocumentCommandHandler', () => {
  test('subscribedTo returns SendDocumentCommand', () => {
    const handler = new SendDocumentCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(SendDocumentCommand);
  });

  test('handle delegates to sender.execute', async () => {
    const mockSender = { execute: vi.fn() };
    const handler = new SendDocumentCommandHandler(mockSender);
    const command = new SendDocumentCommand(
      'inst-1',
      'jid1',
      Buffer.from('doc-data'),
      'f.pdf',
      'application/pdf'
    );

    await handler.handle(command);

    expect(mockSender.execute).toHaveBeenCalledWith(command);
  });
});
