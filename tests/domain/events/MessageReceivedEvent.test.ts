import { describe, expect } from 'vitest';
import { MessageReceivedEvent } from '../../../src/domain/events/MessageReceivedEvent';

describe('MessageReceivedEvent', () => {
  test('creates with correct aggregateId', () => {
    const event = MessageReceivedEvent.create('agg-123', {
      instanceId: 'msg-1',
      chatId: 'sender-id',
      message: 'Hello!',
    });
    expect(event.aggregateId).toBe('agg-123');
  });

  test('creates with correct payload values', () => {
    const payload = { instanceId: 'msg-1', chatId: 'sender-id', message: 'Hello!' };
    const event = MessageReceivedEvent.create('agg-123', payload);
    expect(event.payload).toEqual(payload);
  });

  test('eventName is message.received', () => {
    const event = MessageReceivedEvent.create('agg-1', {
      instanceId: 'm1',
      chatId: 'f',
      message: 'Hi',
    });
    expect(event.eventName).toBe('message.received');
  });

  test('occurredOn is a Date', () => {
    const event = MessageReceivedEvent.create('agg-1', {
      instanceId: 'm1',
      chatId: 'f',
      message: 'Hi',
    });
    expect(event.occurredOn).toBeInstanceOf(Date);
  });

  test('implements IDomainEvent shape', () => {
    const event = MessageReceivedEvent.create('agg-1', {
      instanceId: 'm1',
      chatId: 'f',
      message: 'Hi',
    });
    expect(event.aggregateId).toBeDefined();
    expect(event.eventName).toBeDefined();
    expect(event.occurredOn).toBeDefined();
    expect(event.payload).toBeDefined();
  });
});
