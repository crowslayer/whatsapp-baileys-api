import { AnyDomainEvent } from '@shared/domain/IDomainEventSubscriber';
import { DomainEventSubscribers } from '@shared/infrastructure/event-bus/DomainEventSubscribers';

export interface IEventBus {
  publish(event: AnyDomainEvent[]): Promise<void>;

  addSubscribers(subscribers: DomainEventSubscribers): void;
}
