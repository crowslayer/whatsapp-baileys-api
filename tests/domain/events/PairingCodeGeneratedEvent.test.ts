import { PairingCodeGeneratedEvent } from '../../../src/domain/events/PairingCodeGeneratedEvent'

describe('PairingCodeGeneratedEvent', () => {
  test('creates with correct aggregateId and pairingCode', () => {
    const event = new PairingCodeGeneratedEvent('inst-001', { pairingCode: 'ABC123' })
    expect(event.aggregateId).toBe('inst-001')
    expect(event.payload.pairingCode).toBe('ABC123')
  })

  test('eventName is pairingcode.generated', () => {
    const event = new PairingCodeGeneratedEvent('inst-1', { pairingCode: 'XYZ789' })
    expect(event.eventName).toBe('pairingcode.generated')
  })

  test('occurredOn is a Date', () => {
    const event = new PairingCodeGeneratedEvent('inst-1', { pairingCode: 'XYZ789' })
    expect(event.occurredOn).toBeInstanceOf(Date)
  })
})
