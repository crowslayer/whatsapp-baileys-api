import { ContainerBuilder } from 'node-dependency-injection';

import { AnyDomainEvent, IDomainEventSubscriber } from '@shared/domain/IDomainEventSubscriber';

export class DomainEventSubscribers {
  constructor(public readonly items: Array<IDomainEventSubscriber<AnyDomainEvent>>) {}

  static from(container: ContainerBuilder): DomainEventSubscribers {
    const definitions = Array.from(container.findTaggedServiceIds('subscriber')); // as Map<string, Definition>;
    const subscribers: Array<IDomainEventSubscriber<AnyDomainEvent>> = [];

    definitions.forEach(({ id }) => {
      const domainEventSubscriber = container.get<IDomainEventSubscriber<AnyDomainEvent>>(id);
      subscribers.push(domainEventSubscriber);
    });

    return new DomainEventSubscribers(subscribers);
  }
}
