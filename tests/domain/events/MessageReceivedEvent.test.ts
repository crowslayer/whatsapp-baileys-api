import { describe, expect } from 'vitest';
import { InconmingWhatsAppMessage } from '../../../src/domain/events/InconmingWhatsAppMessage';

describe('MessageReceivedEvent', () => {
  test('creates with correct aggregateId', () => {
    const event = InconmingWhatsAppMessage.create('agg-123', {
      instanceId: 'msg-1',
      chatId: 'sender-id',
      text: 'Hello!',
      from: 'from-1',
      messageId: 'msg-id',
      timestamp: new Date(),
    });
    expect(event.aggregateId).toBe('agg-123');
  });

  test('creates with correct payload values', () => {
    const payload = {
      instanceId: 'msg-1',
      chatId: 'sender-id',
      text: 'Hello!',
      from: 'from-1',
      messageId: 'msg-id',
      timestamp: new Date(),
    };
    const event = InconmingWhatsAppMessage.create('agg-123', payload);
    expect(event.payload).toEqual(payload);
  });

  test('eventName is message.received', () => {
    const event = InconmingWhatsAppMessage.create('agg-1', {
      instanceId: 'm1',
      chatId: 'f',
      text: 'Hi',
      from: 'from-1',
      messageId: 'msg-id',
      timestamp: new Date(),
    });
    expect(event.eventName).toBe('message.received');
  });

  test('occurredOn is a Date', () => {
    const event = InconmingWhatsAppMessage.create('agg-1', {
      instanceId: 'm1',
      chatId: 'f',
      text: 'Hi',
      from: 'from-1',
      messageId: 'msg-id',
      timestamp: new Date(),
    });
    expect(event.occurredOn).toBeInstanceOf(Date);
  });

  test('implements IDomainEvent shape', () => {
    const event = InconmingWhatsAppMessage.create('agg-1', {
      instanceId: 'm1',
      chatId: 'f',
      text: 'Hi',
      from: 'from-1',
      messageId: 'msg-id',
      timestamp: new Date(),
    });
    expect(event.aggregateId).toBeDefined();
    expect(event.eventName).toBeDefined();
    expect(event.occurredOn).toBeDefined();
    expect(event.payload).toBeDefined();
  });
});
