import { Entity } from '@shared/domain/Entity';
import { AnyEvent } from '@shared/domain/event/Event';

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: AnyEvent[] = [];

  get domainEvents(): Readonly<AnyEvent[]> {
    return this._domainEvents;
  }

  pullDomainEvents(): AnyEvent[] {
    const events = [...this.domainEvents];

    this._domainEvents = [];

    return events;
  }

  protected addDomainEvent(event: AnyEvent): void {
    this._domainEvents.push(event);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  protected abstract validate(): void;
}
