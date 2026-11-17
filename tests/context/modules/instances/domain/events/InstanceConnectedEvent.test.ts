import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstanceConnectedEvent } from '@modules/instances/domain/events/InstanceConnectedEvent';

describe('InstanceConnectedEvent', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('preserves connection metadata and payload across serialization', () => {
    // Arrange
    const input = {
      eventId: 'event-connected',
      aggregateId: 'instance-1',
      causationId: 'event-created',
      payload: { instanceId: 'instance-1', phoneNumber: '123456', status: 'connected' },
    };

    // Act
    const event = InstanceConnectedEvent.create(input);
    const restored = InstanceConnectedEvent.fromPrimitives(event.toPrimitives());

    // Assert
    expect(restored.eventName).toBe('instance.connected');
    expect(restored.causationId).toBe('event-created');
    expect(restored.payload).toEqual(input.payload);
    expect(Object.isFrozen(restored.payload)).toBe(true);
  });
});
