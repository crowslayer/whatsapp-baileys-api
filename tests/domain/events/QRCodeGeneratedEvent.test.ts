import { describe, expect } from 'vitest';
import { QRCodeGeneratedEvent } from '../../../src/domain/events/QRCodeGeneratedEvent';

describe('QRCodeGeneratedEvent', () => {
  test('creates with correct aggregateId, qrCode, qrText', () => {
    const event = QRCodeGeneratedEvent.create('inst-001', {
      instanceId: 'inst-123',
      qrCode: 'base64...',
      qrText: 'whatsapp://...',
    }) as QRCodeGeneratedEvent;

    expect(event.aggregateId).toBe('inst-001');
    expect(event.payload.qrCode).toBe('base64...');
    expect(event.payload.qrText).toBe('whatsapp://...');
  });

  test('eventName is qrcode.generated', () => {
    const event = QRCodeGeneratedEvent.create('inst-1', {
      qrCode: 'img',
      qrText: 'url',
      instanceId: 'inst-12',
    });
    expect(event.eventName).toBe('qrcode.generated');
  });

  test('occurredOn is a Date', () => {
    const event = QRCodeGeneratedEvent.create('inst-1', {
      qrCode: 'img',
      qrText: 'url',
      instanceId: 'inst-1',
    });
    expect(event.occurredOn).toBeInstanceOf(Date);
  });
});
