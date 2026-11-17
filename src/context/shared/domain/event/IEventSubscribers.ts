import { ContainerBuilder } from 'node-dependency-injection';

import { AnyEvent } from '@shared/domain/event/Event';
import { IEventSubscriber } from '@shared/domain/event/IEventSubscriber';

export interface IEventSubscribers {
  readonly items: Array<IEventSubscriber<AnyEvent>>;
  from(container: ContainerBuilder): IEventSubscribers;
}
