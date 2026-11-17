import { AnyEvent } from '@shared/domain/event/Event';
import { IEventBus } from '@shared/domain/event/IEventBus';
import { IEventSubscribers } from '@shared/domain/event/IEventSubscribers';

type EventHandler = (event: AnyEvent) => Promise<void>;

export class InMemoryEventBus implements IEventBus {
  private readonly _subscribers = new Map<string, Set<EventHandler>>();

  private readonly _registerSubscribers = new WeakMap<object, Map<string, EventHandler>>();

  async publish(events: AnyEvent[]): Promise<void> {
    await Promise.all(
      events.map(async (event) => {
        const handlers = this._subscribers.get(event.eventName) ?? new Set();

        await Promise.all([...handlers].map((handler) => handler(event)));
      })
    );
  }

  addSubscribers(subscribers: IEventSubscribers): void {
    subscribers.items.forEach((subscriber) => {
      subscriber.subscribedTo().forEach((event) => {
        const eventName = event.EVENT_NAME;

        if (!this._subscribers.has(eventName)) {
          this._subscribers.set(eventName, new Set());
        }
        let registeredEvents = this._registerSubscribers.get(subscriber);

        if (!registeredEvents) {
          registeredEvents = new Map();
          this._registerSubscribers.set(subscriber, registeredEvents);
        }

        if (!registeredEvents.has(eventName)) {
          const handler = subscriber.on.bind(subscriber);

          registeredEvents.set(eventName, handler);
          this._subscribers.get(eventName)?.add(handler);
        }
      });
    });
  }
}
