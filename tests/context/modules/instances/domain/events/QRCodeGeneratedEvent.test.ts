import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QRCodeGeneratedEvent } from '@modules/instances/domain/events/QRCodeGeneratedEvent';

describe('QRCodeGeneratedEvent', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('round trips its QR payload and event metadata', () => {
    // Arrange
    const input = {
      eventId: 'event-qr',
      aggregateId: 'instance-1',
      correlationId: 'correlation-1',
      aggregateVersion: 3,
      payload: { instanceId: 'instance-1', qrCode: 'base64', qrText: 'qr-text' },
    };

    // Act
    const event = QRCodeGeneratedEvent.create(input);
    const restored = QRCodeGeneratedEvent.fromPrimitives(event.toPrimitives());

    // Assert
    expect(restored.eventName).toBe('qrcode.generated');
    expect(restored.payload).toEqual(input.payload);
    expect(restored.correlationId).toBe('correlation-1');
    expect(restored.aggregateVersion).toBe(3);
    expect(Object.isFrozen(restored.payload)).toBe(true);
  });
});
