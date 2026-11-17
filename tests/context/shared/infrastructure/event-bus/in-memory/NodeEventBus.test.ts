import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Event } from '@shared/domain/event/Event';
import type { AnyEventClass, IEventSubscriber } from '@shared/domain/event/IEventSubscriber';
import type { IEventSubscribers } from '@shared/domain/event/IEventSubscribers';
import { NodeEventBus } from '@shared/infrastructure/event-bus/in-memory/NodeEventBus';

class TestEvent extends Event<'test.event', { value: number }> {
  static readonly EVENT_NAME = 'test.event';
  readonly eventName = TestEvent.EVENT_NAME;
  readonly payload: Readonly<{ value: number }>;

  private constructor(metadata: { eventId: string; aggregateId: string }, payload: { value: number }) {
    super(metadata);
    this.payload = this.freezePayload(payload);
  }

  static create(payload: { value: number }): TestEvent {
    return new TestEvent({ eventId: 'event-1', aggregateId: 'aggregate-1' }, payload);
  }

  static fromPrimitives(params: { eventId: string; aggregateId: string; payload: { value: number } }): TestEvent {
    return new TestEvent(params, params.payload);
  }
}

describe('NodeEventBus', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('publishes events to registered subscribers', async () => {
    // Arrange
    const received = vi.fn();
    const subscriber: IEventSubscriber<TestEvent> = {
      subscribedTo: () => [TestEvent as unknown as AnyEventClass],
      on: async (event) => { received(event); },
    };
    const bus = new NodeEventBus();
    bus.addSubscribers({ items: [subscriber], from: vi.fn() } as unknown as IEventSubscribers);
    const event = TestEvent.create({ value: 7 });

    // Act
    await bus.publish([event]);
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assert
    expect(received).toHaveBeenCalledWith(event.payload);
  });
});
