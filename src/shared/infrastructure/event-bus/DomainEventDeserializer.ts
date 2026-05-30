import { DomainEventClass, SerializedDomainEvent } from '@shared/domain/DomainEvent';
import { AnyDomainEvent } from '@shared/domain/IDomainEventSubscriber';
import { DomainEventSubscribers } from '@shared/infrastructure/event-bus/DomainEventSubscribers';

export type DomainEventJSON = SerializedDomainEvent<string, unknown>;

export class DomainEventDeserializer extends Map<
  string,
  DomainEventClass<AnyDomainEvent, DomainEventJSON>
> {
  static configure(subscribers: DomainEventSubscribers): DomainEventDeserializer {
    const mapping = new DomainEventDeserializer();

    subscribers.items.forEach((subscriber) => {
      subscriber.subscribedTo().forEach((eventClass) => {
        mapping.registerEvent(eventClass);
      });
    });

    return mapping;
  }

  private registerEvent(eventClass: DomainEventClass<AnyDomainEvent, DomainEventJSON>): void {
    const eventName = eventClass.EVENT_NAME;
    this.set(eventName, eventClass);
  }

  deserialize(event: string): AnyDomainEvent {
    const parsed = JSON.parse(event);
    const eventData = parsed.data as SerializedDomainEvent<string, unknown>;

    const eventClass = this.get(eventData.eventName);

    if (!eventClass) {
      throw Error(`DomainEvent mapping not found for event ${eventData.eventName}`);
    }

    return eventClass.fromPrimitives(eventData);
  }
}
