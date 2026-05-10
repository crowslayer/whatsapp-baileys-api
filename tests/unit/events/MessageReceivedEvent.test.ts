import { MessageReceivedEvent } from '../../../src/domain/events/MessageReceivedEvent'

describe('MessageReceivedEvent', () => {
  test('creates with correct aggregateId', () => {
    const event = new MessageReceivedEvent('agg-123', {
      messageId: 'msg-1',
      from: 'sender-id',
      message: 'Hello!',
    })
    expect(event.aggregateId).toBe('agg-123')
  })

  test('creates with correct payload values', () => {
    const payload = { messageId: 'msg-1', from: 'sender-id', message: 'Hello!' }
    const event = new MessageReceivedEvent('agg-123', payload)
    expect(event.payload).toEqual(payload)
  })

  test('eventName is message.received', () => {
    const event = new MessageReceivedEvent('agg-1', {
      messageId: 'm1',
      from: 'f',
      message: 'Hi',
    })
    expect(event.eventName).toBe('message.received')
  })

  test('occurredOn is a Date', () => {
    const event = new MessageReceivedEvent('agg-1', {
      messageId: 'm1',
      from: 'f',
      message: 'Hi',
    })
    expect(event.occurredOn).toBeInstanceOf(Date)
  })

  test('implements IDomainEvent shape', () => {
    const event = new MessageReceivedEvent('agg-1', {
      messageId: 'm1',
      from: 'f',
      message: 'Hi',
    })
    expect(event.aggregateId).toBeDefined()
    expect(event.eventName).toBeDefined()
    expect(event.occurredOn).toBeDefined()
    expect(event.payload).toBeDefined()
  })
})
