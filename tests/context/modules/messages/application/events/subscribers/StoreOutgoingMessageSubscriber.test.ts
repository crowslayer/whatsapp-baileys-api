import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StoreOutgoingMessageSubscriber } from '@modules/messages/application/events/subscribers/StoreOutgoingMessageSubscriber';
import { OutgoingWhatsAppMessage } from '@modules/messages/domain/events/OutgoingWhatsAppMessage';
import type { IMessageRepository } from '@modules/messages/domain/IMessageRepository';

describe('StoreOutgoingMessageSubscriber', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('stores outgoing message event data as an aggregate', async () => {
    // Arrange
    const repository = { save: vi.fn().mockResolvedValue(undefined) } as unknown as IMessageRepository;
    const subscriber = new StoreOutgoingMessageSubscriber(repository);
    const timestamp = new Date('2025-01-01T00:00:00.000Z');
    const event = OutgoingWhatsAppMessage.create({
      eventId: 'event-1', aggregateId: 'chat-1',
      payload: {
        instanceId: '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', chatId: 'chat-1', messageId: '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e30',
        senderId: 'bot', timestamp, content: { messageType: 'text', text: 'Hello' },
      },
    });

    // Act
    await subscriber.on(event);

    // Assert
    expect(subscriber.subscribedTo()).toEqual([OutgoingWhatsAppMessage]);
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ direction: 'outgoing', status: 'sent' }));
  });
});
