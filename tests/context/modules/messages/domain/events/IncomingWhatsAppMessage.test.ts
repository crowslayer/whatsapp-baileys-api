import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IncomingWhatsAppMessage } from '@modules/messages/domain/events/IncomingWhatsAppMessage';

describe('IncomingWhatsAppMessage', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('creates, freezes, and restores the incoming message event', () => {
    // Arrange
    const payload = {
      instanceId: 'instance-1', chatId: 'chat-1', messageId: 'message-1', senderId: 'user-1',
      timestamp: new Date('2025-01-02T03:04:05.000Z'), content: { messageType: 'text' as const, text: 'Hi' },
    };
    const occurredOn = new Date('2025-01-02T03:04:05.000Z');

    // Act
    const event = IncomingWhatsAppMessage.create({
      eventId: 'event-1',
      aggregateId: 'chat-1',
      occurredOn,
      payload,
    });
    const restored = IncomingWhatsAppMessage.fromPrimitives(event.toPrimitives());

    // Assert
    expect(event.eventName).toBe('whatsapp.message.received');
    expect(Object.isFrozen(event.payload)).toBe(true);
    expect(restored.payload).toEqual(payload);
    expect(restored.occurredOn).toEqual(occurredOn);
  });
});
