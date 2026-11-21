import EventEmitter from 'events';

import { AnyEvent } from '@shared/domain/event/Event';
import { IEventBus } from '@shared/domain/event/IEventBus';
import { IEventSubscribers } from '@shared/domain/event/IEventSubscribers';
import { EventSubscriberNotFoundError } from '@shared/infrastructure/event-bus/EventSubscriberNotFoundError';

export class NodeEventBus implements IEventBus {
  private _emitter: EventEmitter;

  constructor() {
    this._emitter = new EventEmitter();

    this._emitter.setMaxListeners(100);
  }

  publish(events: AnyEvent[]): Promise<void> {
    events.forEach((event) => {
      this._emitter.emit(event.eventName, event.payload);
    });

    return Promise.resolve();
  }

  addSubscribers(subscribers: IEventSubscribers): void {
    subscribers.items.forEach((subscriber) => {
      subscriber.subscribedTo().forEach((event) => {
        const eventName = event.EVENT_NAME;
        this._emitter.on(eventName, async (event: AnyEvent) => {
          try {
            await subscriber.on(event);
          } catch (error) {
            throw new EventSubscriberNotFoundError(
              `Error executing subscriber "${subscriber.constructor.name}" for event "${eventName}"`,
              { cause: error }
            );
          }
        });
      });
    });
  }
}
