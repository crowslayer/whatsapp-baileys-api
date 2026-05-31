import { AggregateRoot } from '../../../src/shared/domain/AggregateRoot';
import { IDomainEvent } from '../../../src/shared/domain/DomainEvent';

class TestDomainEvent implements IDomainEvent {
  readonly occurredOn: Date;
  readonly eventName: string;
  readonly aggregateId: string;
  readonly payload: Record<string, unknown>;
  readonly eventId: string;
  readonly correlationId?: string | undefined;
  readonly causationId?: string | undefined;
  readonly aggregateVersion?: number | undefined;

  constructor(aggregateId: string) {
    this.occurredOn = new Date();
    this.eventName = 'test.event';
    this.aggregateId = aggregateId;
    this.payload = {};
  }
}

class TestAggregate extends AggregateRoot<string> {
  constructor(id: string) {
    super(id);
  }

  protected validate(): void {}

  exposeAddEvent(event: IDomainEvent): void {
    this.addDomainEvent(event);
  }
}

describe('AggregateRoot', () => {
  test('domainEvents starts empty', () => {
    const agg = new TestAggregate('agg-1');
    expect(agg.domainEvents).toEqual([]);
  });

  test('addDomainEvent adds event to list', () => {
    const agg = new TestAggregate('agg-1');
    const event = new TestDomainEvent('agg-1');
    agg.exposeAddEvent(event);
    expect(agg.domainEvents).toHaveLength(1);
    expect(agg.domainEvents[0]).toBe(event);
  });

  test('clearEvents empties the list', () => {
    const agg = new TestAggregate('agg-1');
    agg.exposeAddEvent(new TestDomainEvent('agg-1'));
    agg.clearEvents();
    expect(agg.domainEvents).toEqual([]);
  });

  test('multiple events can be added', () => {
    const agg = new TestAggregate('agg-1');
    agg.exposeAddEvent(new TestDomainEvent('agg-1'));
    agg.exposeAddEvent(new TestDomainEvent('agg-1'));
    agg.exposeAddEvent(new TestDomainEvent('agg-1'));
    expect(agg.domainEvents).toHaveLength(3);
  });

  test('inherits Entity functionality (id, equals)', () => {
    const a = new TestAggregate('agg-a');
    const b = new TestAggregate('agg-b');
    expect(a.id).toBe('agg-a');
    expect(a.equals(a)).toBe(true);
    expect(a.equals(b)).toBe(false);
  });
});
