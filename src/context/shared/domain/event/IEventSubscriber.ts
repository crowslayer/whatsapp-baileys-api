import { AnyEvent, EventClass, SerializedEvent } from '@shared/domain/event/Event';

export type AnySerializedEvent = SerializedEvent<string, unknown>;

export type AnyEventClass = EventClass<AnyEvent, AnySerializedEvent>;

export interface IEventSubscriber<TEvent extends AnyEvent> {
  subscribedTo(): Array<AnyEventClass>;
  on(event: TEvent): Promise<void>;
}
