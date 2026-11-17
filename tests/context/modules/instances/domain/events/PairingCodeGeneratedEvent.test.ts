import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PairingCodeGeneratedEvent } from '@modules/instances/domain/events/PairingCodeGeneratedEvent';

describe('PairingCodeGeneratedEvent', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('creates and restores its pairing code payload', () => {
    // Arrange
    const input = {
      eventId: 'event-pairing',
      aggregateId: 'instance-1',
      payload: { instanceId: 'instance-1', pairingCode: '12345678' },
    };

    // Act
    const event = PairingCodeGeneratedEvent.create(input);
    const restored = PairingCodeGeneratedEvent.fromPrimitives(event.toPrimitives());

    // Assert
    expect(event.eventName).toBe('pairingcode.generated');
    expect(restored.payload).toEqual(input.payload);
    expect(Object.isFrozen(event.payload)).toBe(true);
  });
});
