import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstanceCreatedEvent } from '@modules/instances/domain/events/InstanceCreatedEvent';

describe('InstanceCreatedEvent', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('creates and restores instance creation data', () => {
    // Arrange
    const input = {
      eventId: 'event-created',
      aggregateId: 'instance-1',
      payload: { name: 'Primary', createdAt: '2025-01-01T00:00:00.000Z', phoneNumber: '123' },
    };

    // Act
    const event = InstanceCreatedEvent.create(input);
    const restored = InstanceCreatedEvent.fromPrimitives(event.toPrimitives());

    // Assert
    expect(restored.eventName).toBe('instance.created');
    expect(restored.payload).toEqual(input.payload);
    expect(restored.aggregateId).toBe('instance-1');
  });
});
