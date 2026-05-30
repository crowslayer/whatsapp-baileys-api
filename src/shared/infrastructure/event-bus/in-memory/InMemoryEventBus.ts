import { AnyDomainEvent } from '@shared/domain/IDomainEventSubscriber';
import { IEventBus } from '@shared/domain/IEventBus';
import { DomainEventSubscribers } from '@shared/infrastructure/event-bus/DomainEventSubscribers';

type EventHandler = (event: AnyDomainEvent) => Promise<void>;

export class InMemoryEventBus implements IEventBus {
  private readonly _subscribers = new Map<string, Set<EventHandler>>();

  async publish(events: AnyDomainEvent[]): Promise<void> {
    await Promise.all(
      events.map(async (event) => {
        const handlers = this._subscribers.get(event.eventName) ?? new Set();

        await Promise.all([...handlers].map((handler) => handler(event)));
      })
    );
  }

  addSubscribers(subscribers: DomainEventSubscribers): void {
    subscribers.items.forEach((subscriber) => {
      subscriber.subscribedTo().forEach((event) => {
        const eventName = event.EVENT_NAME;
        if (!this._subscribers.has(eventName)) {
          this._subscribers.set(eventName, new Set());
        }

        this._subscribers.get(eventName)?.add(subscriber.on.bind(subscriber));
      });
    });
  }
}
