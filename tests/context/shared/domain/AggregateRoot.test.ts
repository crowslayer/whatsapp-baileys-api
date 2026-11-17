import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AggregateRoot } from '@shared/domain/AggregateRoot';
import { Entity } from '@shared/domain/Entity';
import { AnyEvent, Event, IEventMetadata } from '@shared/domain/event/Event';

class TestEvent extends Event<'test.event', { value: string }> {
  readonly eventName = 'test.event' as const;
  readonly payload: Readonly<{ value: string }>;

  constructor(metadata: IEventMetadata, payload: { value: string }) {
    super(metadata);
    this.payload = this.freezePayload(payload);
  }
}

class TestAggregate extends AggregateRoot<string> {
  constructor(id: string) {
    super(id);
  }

  emit(event: AnyEvent): void {
    this.addDomainEvent(event);
  }

  protected validate(): void {}
}

const metadata: IEventMetadata = {
  eventId: 'event-1',
  aggregateId: 'aggregate-1',
};

describe('AggregateRoot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is an instance of Entity', () => {
    const aggregate = new TestAggregate('aggregate-1');

    expect(aggregate).toBeInstanceOf(Entity);
    expect(aggregate).toBeInstanceOf(AggregateRoot);
  });

  it('starts without domain events', () => {
    const aggregate = new TestAggregate('aggregate-1');

    expect(aggregate.domainEvents).toEqual([]);
    expect(aggregate.domainEvents).toHaveLength(0);
  });

  it('collects the events added to the aggregate', () => {
    const aggregate = new TestAggregate('aggregate-1');
    const event = new TestEvent(metadata, { value: 'a' });

    aggregate.emit(event);

    expect(aggregate.domainEvents).toHaveLength(1);
    expect(aggregate.domainEvents[0]).toBe(event);
  });

  it('keeps the order in which the events were added', () => {
    const aggregate = new TestAggregate('aggregate-1');
    const first = new TestEvent(metadata, { value: 'a' });
    const second = new TestEvent(metadata, { value: 'b' });

    aggregate.emit(first);
    aggregate.emit(second);

    expect(aggregate.domainEvents[0]).toBe(first);
    expect(aggregate.domainEvents[1]).toBe(second);
  });

  it('returns the accumulated events and empties the internal list', () => {
    const aggregate = new TestAggregate('aggregate-1');
    const event = new TestEvent(metadata, { value: 'a' });
    aggregate.emit(event);

    const pulled = aggregate.pullDomainEvents();

    expect(pulled).toHaveLength(1);
    expect(pulled[0]).toBe(event);
    expect(aggregate.domainEvents).toHaveLength(0);
  });

  it('returns an empty array when there are no pending events', () => {
    const aggregate = new TestAggregate('aggregate-1');

    expect(aggregate.pullDomainEvents()).toEqual([]);
  });

  it('returns a copy of the events list instead of the internal reference', () => {
    const aggregate = new TestAggregate('aggregate-1');
    aggregate.emit(new TestEvent(metadata, { value: 'a' }));

    const pulled = aggregate.pullDomainEvents();

    expect(pulled).not.toBe(aggregate.domainEvents);
  });

  it('removes every pending event when clearEvents is called', () => {
    const aggregate = new TestAggregate('aggregate-1');
    aggregate.emit(new TestEvent(metadata, { value: 'a' }));
    aggregate.emit(new TestEvent(metadata, { value: 'b' }));

    aggregate.clearEvents();

    expect(aggregate.domainEvents).toHaveLength(0);
  });

  it('allows adding new events after the list was cleared', () => {
    const aggregate = new TestAggregate('aggregate-1');
    aggregate.emit(new TestEvent(metadata, { value: 'a' }));
    aggregate.clearEvents();

    const event = new TestEvent(metadata, { value: 'b' });
    aggregate.emit(event);

    expect(aggregate.domainEvents).toHaveLength(1);
    expect(aggregate.domainEvents[0]).toBe(event);
  });

  it('exposes the domain events through the readonly getter', () => {
    const aggregate = new TestAggregate('aggregate-1');
    const event = new TestEvent(metadata, { value: 'a' });
    aggregate.emit(event);

    const events: readonly AnyEvent[] = aggregate.domainEvents;

    expect(events).toHaveLength(1);
    expect(events[0]).toBe(event);
  });
});
