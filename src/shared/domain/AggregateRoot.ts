import { IDomainEvent } from '@shared/domain/DomainEvent';
import { Entity } from '@shared/domain/Entity';

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: IDomainEvent[] = [];

  get domainEvents(): Readonly<IDomainEvent[]> {
    return this._domainEvents;
  }

  pullDomainEvents(): IDomainEvent[] {
    const events = [...this.domainEvents];

    this._domainEvents = [];

    return events;
  }

  protected addDomainEvent(event: IDomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  protected abstract validate(): void;
}
