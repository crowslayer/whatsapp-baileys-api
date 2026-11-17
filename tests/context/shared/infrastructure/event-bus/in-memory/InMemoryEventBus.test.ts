import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InMemoryEventBus } from '@shared/infrastructure/event-bus/in-memory/InMemoryEventBus';
import type { AnyEventClass, IEventSubscriber } from '@shared/domain/event/IEventSubscriber';
import type { AnyEvent } from '@shared/domain/event/Event';
import { InstanceCreatedEvent } from '@modules/instances/domain/events/InstanceCreatedEvent';

describe('InMemoryEventBus', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('publishes an event to registered subscribers', async () => {
    // Arrange
    const event = InstanceCreatedEvent.create({
      eventId: 'event-1', aggregateId: 'instance-1',
      payload: { name: 'Main', createdAt: '2025-01-01T00:00:00.000Z' },
    });
    const on = vi.fn().mockResolvedValue(undefined);
    const subscriber: IEventSubscriber<AnyEvent> = {
      subscribedTo: () => [InstanceCreatedEvent as unknown as AnyEventClass], on,
    };
    const bus = new InMemoryEventBus();
    bus.addSubscribers({ items: [subscriber], from: vi.fn() });

    // Act
    await bus.publish([event]);

    // Assert
    expect(on).toHaveBeenCalledWith(event);
  });

  it('does not register the same subscriber and event more than once', async () => {
    // Arrange
    const event = InstanceCreatedEvent.create({
      eventId: 'event-2', aggregateId: 'instance-1',
      payload: { name: 'Main', createdAt: '2025-01-01T00:00:00.000Z' },
    });
    const on = vi.fn().mockResolvedValue(undefined);
    const subscriber: IEventSubscriber<AnyEvent> = {
      subscribedTo: () => [InstanceCreatedEvent as unknown as AnyEventClass], on,
    };
    const bus = new InMemoryEventBus();
    const subscribers = { items: [subscriber], from: vi.fn() };
    bus.addSubscribers(subscribers);
    bus.addSubscribers(subscribers);

    // Act
    await bus.publish([event]);

    // Assert
    expect(on).toHaveBeenCalledTimes(1);
  });
});
