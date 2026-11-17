import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EventJsonSerializer } from '@shared/infrastructure/event-bus/EventJsonSerializer';
import { InstanceCreatedEvent } from '@modules/instances/domain/events/InstanceCreatedEvent';

describe('EventJsonSerializer', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('serializes an event inside the data envelope', () => {
    // Arrange
    const event = InstanceCreatedEvent.create({
      eventId: 'event-1', aggregateId: 'instance-1',
      payload: { name: 'Main', createdAt: '2025-01-01T00:00:00.000Z' },
    });

    // Act
    const serialized = EventJsonSerializer.serialize(event);

    // Assert
    expect(JSON.parse(serialized)).toEqual({ data: event.toPrimitives() });
  });
});
