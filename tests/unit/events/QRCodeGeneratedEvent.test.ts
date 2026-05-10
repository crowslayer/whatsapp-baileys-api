import { QRCodeGeneratedEvent } from '../../../src/domain/events/QRCodeGeneratedEvent'

describe('QRCodeGeneratedEvent', () => {
  test('creates with correct aggregateId, qrCode, qrText', () => {
    const event = new QRCodeGeneratedEvent('inst-001', {
      qrCode: 'base64...',
      qrText: 'whatsapp://...',
    })
    expect(event.aggregateId).toBe('inst-001')
    expect(event.payload.qrCode).toBe('base64...')
    expect(event.payload.qrText).toBe('whatsapp://...')
  })

  test('eventName is qrcode.generated', () => {
    const event = new QRCodeGeneratedEvent('inst-1', {
      qrCode: 'img',
      qrText: 'url',
    })
    expect(event.eventName).toBe('qrcode.generated')
  })

  test('occurredOn is a Date', () => {
    const event = new QRCodeGeneratedEvent('inst-1', {
      qrCode: 'img',
      qrText: 'url',
    })
    expect(event.occurredOn).toBeInstanceOf(Date)
  })
})
