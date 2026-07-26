import type {
  AnyDomainEvent,
  DomainEventClass,
  SerializedDomainEvent,
} from '@shared/domain/DomainEvent';

export type AnySerializedDomainEvent = SerializedDomainEvent<string, unknown>;

export type AnyDomainEventClass = DomainEventClass<AnyDomainEvent, AnySerializedDomainEvent>;

export interface IDomainEventSubscriber<TEvent extends AnyDomainEvent> {
  subscribedTo(): Array<AnyDomainEventClass>;
  on(event: TEvent): Promise<void>;
}
