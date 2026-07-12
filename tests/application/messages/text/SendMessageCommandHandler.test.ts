import { describe, expect, vi } from 'vitest';
import { SendMessageCommand } from '../../../../src/application/messages/text/SendMessageCommand';
import { SendMessageCommandHandler } from '../../../../src/application/messages/text/SendMessageCommandHandler';

describe('SendMessageCommandHandler', () => {
  test('should send message with normalized jid', async () => {
    const mockSender = { execute: vi.fn() };
    const handler = new SendMessageCommandHandler(mockSender);
    const command = new SendMessageCommand('inst-1', '+525512345678', 'Hello');

    await handler.handle(command);
    expect(mockSender.execute).toHaveBeenCalled();
    const [instanceId, jid] = mockSender.execute.mock.calls[0];
    expect(instanceId).toBe('inst-1');
    expect(jid).toContain('@s.whatsapp.net');
  });

  test('subscribedTo returns SendMessageCommand', () => {
    const handler = new SendMessageCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(SendMessageCommand);
  });
});
