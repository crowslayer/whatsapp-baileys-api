import { AnyDomainEvent } from '@shared/domain/DomainEvent';
import { Entity } from '@shared/domain/Entity';

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: AnyDomainEvent[] = [];

  get domainEvents(): Readonly<AnyDomainEvent[]> {
    return this._domainEvents;
  }

  pullDomainEvents(): AnyDomainEvent[] {
    const events = [...this.domainEvents];

    this._domainEvents = [];

    return events;
  }

  protected addDomainEvent(event: AnyDomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  protected abstract validate(): void;
}
