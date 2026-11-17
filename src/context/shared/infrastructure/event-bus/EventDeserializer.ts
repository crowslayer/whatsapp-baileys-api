import { AnyEvent, EventClass, SerializedEvent } from '@shared/domain/event/Event';
import { IEventSubscribers } from '@shared/domain/event/IEventSubscribers';
import { EventDeserializationError } from '@shared/infrastructure/event-bus/EventDeserializationError';

export type EventJSON = SerializedEvent<string, unknown>;

export class EventDeserializer extends Map<string, EventClass<AnyEvent, EventJSON>> {
  static configure(subscribers: IEventSubscribers): EventDeserializer {
    const mapping = new EventDeserializer();

    subscribers.items.forEach((subscriber) => {
      subscriber.subscribedTo().forEach((eventClass) => {
        mapping.registerEvent(eventClass);
      });
    });

    return mapping;
  }

  private registerEvent(eventClass: EventClass<AnyEvent, EventJSON>): void {
    const eventName = eventClass.EVENT_NAME;
    this.set(eventName, eventClass);
  }

  deserialize(event: string): AnyEvent {
    const parsed = JSON.parse(event);
    const eventData = parsed.data as SerializedEvent<string, unknown>;

    const eventClass = this.get(eventData.eventName);

    if (!eventClass) {
      throw new EventDeserializationError(
        `DomainEvent mapping not found for event ${eventData.eventName}`
      );
    }

    return eventClass.fromPrimitives(eventData);
  }
}
