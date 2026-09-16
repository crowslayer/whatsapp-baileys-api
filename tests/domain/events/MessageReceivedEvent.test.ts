import { describe, expect } from 'vitest';
import { IncomingWhatsAppMessage } from '../../../src/domain/events/IncomingWhatsAppMessage';

describe('MessageReceivedEvent', () => {
  test('creates with correct aggregateId', () => {
    const event = IncomingWhatsAppMessage.create('agg-123', {
      instanceId: 'msg-1',
      chatId: 'sender-id',
      content: {
        messageType: 'text',
        text: 'Hello!',
      },
      senderId: 'from-1',
      messageId: 'msg-id',
      timestamp: new Date(),
    });
    expect(event.aggregateId).toBe('agg-123');
  });

  test('creates with correct payload values', () => {
    const payload = {
      instanceId: 'msg-1',
      chatId: 'sender-id',
      senderId: 'from-1',
      content: {
        messageType: 'text',
        text: 'Hello!',
      },
      messageId: 'msg-id',
      timestamp: new Date(),
    };
    const event = IncomingWhatsAppMessage.create('agg-123', payload);
    expect(event.payload).toEqual(payload);
  });

  test('eventName is message.received', () => {
    const event = IncomingWhatsAppMessage.create('agg-1', {
      instanceId: 'm1',
      chatId: 'f',
      senderId: 'from-1',
      messageId: 'msg-id',
      timestamp: new Date(),
      content: {
        messageType: 'text',
        text: 'Hello!',
      },
    });
    expect(event.eventName).toBe('whatsapp.message.received');
  });

  test('occurredOn is a Date', () => {
    const event = IncomingWhatsAppMessage.create('agg-1', {
      instanceId: 'm1',
      chatId: 'f',
      senderId: 'from-1',
      messageId: 'msg-id',
      timestamp: new Date(),
      content: {
        messageType: 'text',
        text: 'Hello!',
      },
    });
    expect(event.occurredOn).toBeInstanceOf(Date);
  });

  test('implements IDomainEvent shape', () => {
    const event = IncomingWhatsAppMessage.create('agg-1', {
      instanceId: 'm1',
      chatId: 'f',
      senderId: 'from-1',
      messageId: 'msg-id',
      timestamp: new Date(),
      content: {
        messageType: 'text',
        text: 'Hello!',
      },
    });
    expect(event.aggregateId).toBeDefined();
    expect(event.eventName).toBeDefined();
    expect(event.occurredOn).toBeDefined();
    expect(event.payload).toBeDefined();
  });
});
