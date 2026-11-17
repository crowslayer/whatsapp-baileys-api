import { AnyEvent } from '@shared/domain/event/Event';
import { IEventSubscribers } from '@shared/domain/event/IEventSubscribers';

export interface IEventBus {
  publish(event: AnyEvent[]): Promise<void>;

  addSubscribers(subscribers: IEventSubscribers): void;
}
