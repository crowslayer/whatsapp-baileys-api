import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RequestFile } from '@shared/domain/RequestFile';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

import { DocumentSender } from '@modules/messages/application/document/DocumentSender';
import { SendDocumentCommand } from '@modules/messages/application/document/SendDocumentCommand';
import { SendDocumentCommandHandler } from '@modules/messages/application/document/SendDocumentCommandHandler';

const INSTANCE_UUID = '0198f3a2-1b4c-7d5e-8f90-1234567890ab';

const buildFile = (): RequestFile => ({
  source: 'remote',
  url: 'https://example.com/document.pdf',
});

const buildSentMessage = (): ISentMessage => ({
  messageId: 'message-1',
  chatId: 'chat-1',
  timestamp: new Date('2024-01-01T00:00:00.000Z'),
  senderId: INSTANCE_UUID,
  content: { messageType: 'document', media: { storageKey: 'key' } },
});

describe('SendDocumentCommandHandler', () => {
  let useCase: DocumentSender;
  let handler: SendDocumentCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = {
      execute: vi.fn().mockResolvedValue(buildSentMessage()),
    } as unknown as DocumentSender;
    handler = new SendDocumentCommandHandler(useCase);
  });

  it('subscribes to the SendDocumentCommand', () => {
    expect(handler.subscribedTo()).toBe(SendDocumentCommand);
  });

  it('executes the use case once', async () => {
    const command = new SendDocumentCommand(
      INSTANCE_UUID,
      'to@s.whatsapp.net',
      buildFile(),
      'application/pdf'
    );

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('forwards the original command to the use case', async () => {
    const command = new SendDocumentCommand(
      INSTANCE_UUID,
      'to@s.whatsapp.net',
      buildFile(),
      'application/pdf',
      'caption'
    );

    await handler.handle(command);

    expect(useCase.execute).toHaveBeenCalledWith(command);
  });

  it('returns the sent message produced by the use case', async () => {
    const command = new SendDocumentCommand(
      INSTANCE_UUID,
      'to@s.whatsapp.net',
      buildFile(),
      'application/pdf'
    );

    const result = await handler.handle(command);

    expect(result).toEqual(buildSentMessage());
  });

  it('propagates the use case failure', async () => {
    vi.mocked(useCase.execute).mockRejectedValue(new Error('instance not found'));
    const command = new SendDocumentCommand(
      INSTANCE_UUID,
      'to@s.whatsapp.net',
      buildFile(),
      'application/pdf'
    );

    await expect(handler.handle(command)).rejects.toThrow('instance not found');
  });
});
