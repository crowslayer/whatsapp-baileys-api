import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StoreIncomingMessageSubscriber } from '@modules/messages/application/events/subscribers/StoreIncomingMessageSubscriber';
import { IncomingWhatsAppMessage } from '@modules/messages/domain/events/IncomingWhatsAppMessage';
import type { IMessageRepository } from '@modules/messages/domain/IMessageRepository';

describe('StoreIncomingMessageSubscriber', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('stores incoming message event data as an aggregate', async () => {
    // Arrange
    const repository = { save: vi.fn().mockResolvedValue(undefined) } as unknown as IMessageRepository;
    const subscriber = new StoreIncomingMessageSubscriber(repository);
    const timestamp = new Date('2025-01-01T00:00:00.000Z');
    const event = IncomingWhatsAppMessage.create({
      eventId: 'event-1', aggregateId: 'chat-1',
      payload: {
        instanceId: '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', chatId: 'chat-1', messageId: '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e30',
        senderId: 'user-1', timestamp, content: { messageType: 'text', text: 'Hello' },
      },
    });

    // Act
    await subscriber.on(event);

    // Assert
    expect(subscriber.subscribedTo()).toEqual([IncomingWhatsAppMessage]);
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ direction: 'incoming' }));
  });
});
