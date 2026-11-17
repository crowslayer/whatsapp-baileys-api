import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AnyEventClass, IEventSubscriber } from '@shared/domain/event/IEventSubscriber';
import type { AnyEvent } from '@shared/domain/event/Event';
import { EventDeserializer } from '@shared/infrastructure/event-bus/EventDeserializer';
import { EventJsonSerializer } from '@shared/infrastructure/event-bus/EventJsonSerializer';
import { EventDeserializationError } from '@shared/infrastructure/event-bus/EventDeserializationError';
import { InstanceCreatedEvent } from '@modules/instances/domain/events/InstanceCreatedEvent';

describe('EventDeserializer', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  const createMapping = (): EventDeserializer => {
    const subscriber: IEventSubscriber<AnyEvent> = {
      subscribedTo: () => [InstanceCreatedEvent as unknown as AnyEventClass],
      on: vi.fn().mockResolvedValue(undefined),
    };
    return EventDeserializer.configure({ items: [subscriber], from: vi.fn() });
  };

  it('deserializes a registered event type', () => {
    // Arrange
    const event = InstanceCreatedEvent.create({
      eventId: 'event-1', aggregateId: 'instance-1',
      payload: { name: 'Main', createdAt: '2025-01-01T00:00:00.000Z' },
    });
    const mapping = createMapping();

    // Act
    const result = mapping.deserialize(EventJsonSerializer.serialize(event));

    // Assert
    expect(result).toBeInstanceOf(InstanceCreatedEvent);
    expect(result.payload).toEqual(event.payload);
  });

  it('throws a domain error for an unregistered event name', () => {
    // Arrange
    const mapping = createMapping();
    const serialized = JSON.stringify({ data: { eventName: 'unknown.event' } });

    // Act / Assert
    expect(() => mapping.deserialize(serialized)).toThrow(EventDeserializationError);
  });
});
