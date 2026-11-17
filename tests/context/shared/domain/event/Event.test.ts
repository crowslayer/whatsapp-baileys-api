import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AnyEvent, Event, IEventMetadata } from '@shared/domain/event/Event';
import { IEvent } from '@shared/domain/event/IEvent';

class TestEvent extends Event<'test.event', { value: string }> {
  readonly eventName = 'test.event' as const;
  readonly payload: Readonly<{ value: string }>;

  constructor(metadata: IEventMetadata, payload: { value: string }) {
    super(metadata);
    this.payload = this.freezePayload(payload);
  }
}

describe('Event', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores the event id and the aggregate id from the metadata', () => {
    const event = new TestEvent({ eventId: 'event-1', aggregateId: 'aggregate-1' }, { value: 'a' });

    expect(event.eventId).toBe('event-1');
    expect(event.aggregateId).toBe('aggregate-1');
  });

  it('implements the IEvent contract', () => {
    const event = new TestEvent({ eventId: 'event-1', aggregateId: 'aggregate-1' }, { value: 'a' });

    expect(event).toBeInstanceOf(Event);
    expect(event as unknown as IEvent).toBeDefined();
  });

  it('stores the provided occurredOn date', () => {
    const occurredOn = new Date('2024-01-01T00:00:00.000Z');
    const event = new TestEvent(
      { eventId: 'event-1', aggregateId: 'aggregate-1', occurredOn },
      { value: 'a' }
    );

    expect(event.occurredOn).toBe(occurredOn);
  });

  it('defaults occurredOn to the current date', () => {
    const before = Date.now();
    const event = new TestEvent({ eventId: 'event-1', aggregateId: 'aggregate-1' }, { value: 'a' });
    const after = Date.now();

    expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(before);
    expect(event.occurredOn.getTime()).toBeLessThanOrEqual(after);
  });

  it('stores the optional correlation and causation ids', () => {
    const event = new TestEvent(
      {
        eventId: 'event-1',
        aggregateId: 'aggregate-1',
        correlationId: 'correlation-1',
        causationId: 'causation-1',
      },
      { value: 'a' }
    );

    expect(event.correlationId).toBe('correlation-1');
    expect(event.causationId).toBe('causation-1');
  });

  it('leaves the optional correlation and causation ids undefined', () => {
    const event = new TestEvent({ eventId: 'event-1', aggregateId: 'aggregate-1' }, { value: 'a' });

    expect(event.correlationId).toBeUndefined();
    expect(event.causationId).toBeUndefined();
  });

  it('defaults the aggregate version to one', () => {
    const event = new TestEvent({ eventId: 'event-1', aggregateId: 'aggregate-1' }, { value: 'a' });

    expect(event.aggregateVersion).toBe(1);
  });

  it('stores the provided aggregate version', () => {
    const event = new TestEvent(
      { eventId: 'event-1', aggregateId: 'aggregate-1', aggregateVersion: 7 },
      { value: 'a' }
    );

    expect(event.aggregateVersion).toBe(7);
  });

  it('freezes the payload so it cannot be mutated', () => {
    const event = new TestEvent({ eventId: 'event-1', aggregateId: 'aggregate-1' }, { value: 'a' });

    expect(Object.isFrozen(event.payload)).toBe(true);
  });

  it('serializes the event into primitives', () => {
    const occurredOn = new Date('2024-01-01T00:00:00.000Z');
    const event = new TestEvent(
      {
        eventId: 'event-1',
        aggregateId: 'aggregate-1',
        occurredOn,
        correlationId: 'correlation-1',
        causationId: 'causation-1',
        aggregateVersion: 3,
      },
      { value: 'a' }
    );

    const primitives = event.toPrimitives();

    expect(primitives).toEqual({
      eventId: 'event-1',
      eventName: 'test.event',
      aggregateId: 'aggregate-1',
      occurredOn: '2024-01-01T00:00:00.000Z',
      correlationId: 'correlation-1',
      causationId: 'causation-1',
      aggregateVersion: 3,
      payload: { value: 'a' },
    });
  });

  it('serializes undefined optional metadata as undefined', () => {
    const event = new TestEvent({ eventId: 'event-1', aggregateId: 'aggregate-1' }, { value: 'a' });

    const primitives = event.toPrimitives();

    expect(primitives.correlationId).toBeUndefined();
    expect(primitives.causationId).toBeUndefined();
  });

  it('is compatible with the AnyEvent type', () => {
    const event: AnyEvent = new TestEvent(
      { eventId: 'event-1', aggregateId: 'aggregate-1' },
      { value: 'a' }
    );

    expect(event.eventName).toBe('test.event');
  });
});
