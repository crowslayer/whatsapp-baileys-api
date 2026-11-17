import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IncomingMessageBotSubscriber } from '@modules/bot/application/events/subscribers/IncomingMessageBotSubscriber';
import { IncomingWhatsAppMessage } from '@modules/messages/domain/events/IncomingWhatsAppMessage';
import type { MessagePayload } from '@shared/domain/whatsapp/MessageTypes';
import type { IBotService } from '@modules/bot/domain/types/IBotService';

describe('IncomingMessageBotSubscriber', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  const createEvent = (content: MessagePayload['content']): IncomingWhatsAppMessage =>
    IncomingWhatsAppMessage.create({
      eventId: 'event-1', aggregateId: 'chat-1',
      payload: {
        instanceId: 'instance-1', chatId: 'chat-1', messageId: 'message-1', senderId: 'user-1',
        timestamp: new Date('2025-01-01T00:00:00.000Z'), content,
      },
    });

  it('handles text messages by forwarding their conversation details', async () => {
    // Arrange
    const botService = { handleMessage: vi.fn().mockResolvedValue(undefined) } as unknown as IBotService;
    const subscriber = new IncomingMessageBotSubscriber(botService);
    const event = createEvent({ messageType: 'text', text: 'Hello' });

    // Act
    await subscriber.on(event);

    // Assert
    expect(subscriber.subscribedTo()).toEqual([IncomingWhatsAppMessage]);
    expect(botService.handleMessage).toHaveBeenCalledWith({
      instanceId: 'instance-1', conversationId: 'chat-1', messageId: 'message-1', senderId: 'user-1', text: 'Hello',
    });
  });

  it('ignores non-text message content', async () => {
    // Arrange
    const botService = { handleMessage: vi.fn() } as unknown as IBotService;
    const subscriber = new IncomingMessageBotSubscriber(botService);
    const event = createEvent({ messageType: 'image', media: {} });

    // Act
    await subscriber.on(event);

    // Assert
    expect(botService.handleMessage).not.toHaveBeenCalled();
  });
});
