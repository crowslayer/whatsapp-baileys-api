import { TextMessageSender } from '../../../../src/application/messages/text/TextMessageSender';

describe('TextMessageSender', () => {
  test('should throw when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) };
    const sender = new TextMessageSender(mockRepo, { send: vi.fn() });
    await expect(sender.execute('inst-1', 'jid1@s.whatsapp.net', 'Hello')).rejects.toThrow(
      'not found'
    );
  });

  test('should throw when instance cannot send messages', async () => {
    const mockInstance = { instanceId: 'inst-1', canSendMessages: () => false };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const sender = new TextMessageSender(mockRepo, { send: vi.fn() });
    await expect(sender.execute('inst-1', 'jid', 'Hello')).rejects.toThrow('not connected');
  });

  test('should send message successfully', async () => {
    const mockInstance = { instanceId: 'inst-1', canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockOrchestrator = { send: vi.fn() };
    const sender = new TextMessageSender(mockRepo, mockOrchestrator);

    await sender.execute('inst-1', 'jid1@s.whatsapp.net', 'Hello!');
    expect(mockOrchestrator.send).toHaveBeenCalledWith('inst-1', 'jid1@s.whatsapp.net', 'Hello!');
  });
});
