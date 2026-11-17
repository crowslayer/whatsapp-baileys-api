import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OutgoingWhatsAppMessage } from '@modules/messages/domain/events/OutgoingWhatsAppMessage';

describe('OutgoingWhatsAppMessage', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('creates and serializes the sent message payload', () => {
    // Arrange
    const payload = {
      instanceId: 'instance-1', chatId: 'chat-1', messageId: 'message-2', senderId: 'bot',
      timestamp: new Date('2025-01-02T03:04:05.000Z'), content: { messageType: 'text' as const, text: 'Hello' },
    };

    // Act
    const event = OutgoingWhatsAppMessage.create({
      eventId: 'event-2',
      aggregateId: 'chat-1',
      payload,
    });
    const serialized = event.toPrimitives();
    const restored = OutgoingWhatsAppMessage.fromPrimitives(serialized);

    // Assert
    expect(serialized.eventName).toBe('whatsapp.message.sended');
    expect(serialized.aggregateVersion).toBe(1);
    expect(Object.isFrozen(event.payload)).toBe(true);
    expect(restored.payload).toEqual(payload);
  });
});
