import { ContainerBuilder } from 'node-dependency-injection';

import { AnyEvent } from '@shared/domain/event/Event';
import { IEventSubscriber } from '@shared/domain/event/IEventSubscriber';
import { IEventSubscribers } from '@shared/domain/event/IEventSubscribers';

export class EventSubscribers implements IEventSubscribers {
  constructor(public readonly items: Array<IEventSubscriber<AnyEvent>>) {}

  static from(container: ContainerBuilder): IEventSubscribers {
    const taggedServices = container.findTaggedServiceIds('subscriber');
    const servicesIds = Object.keys(taggedServices);

    const subscribers: Array<IEventSubscriber<AnyEvent>> = [];

    servicesIds.forEach((id) => {
      const domainEventSubscriber = container.get<IEventSubscriber<AnyEvent>>(id);
      subscribers.push(domainEventSubscriber);
    });

    return new EventSubscribers(subscribers);
  }

  from(container: ContainerBuilder): IEventSubscribers {
    return EventSubscribers.from(container);
  }
}
