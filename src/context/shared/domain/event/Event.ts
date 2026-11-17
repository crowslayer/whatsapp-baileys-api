import { IEvent } from '@shared/domain/event/IEvent';

export interface IEventMetadata {
  eventId: string;
  aggregateId: string;
  occurredOn?: Date;
  correlationId?: string;
  causationId?: string;
  aggregateVersion?: number;
}

interface ISerializedEventMetadata {
  eventId: string;
  aggregateId: string;
  occurredOn: string;
  correlationId?: string;
  causationId?: string;
  aggregateVersion?: number;
}

export type SerializedEvent<TEventName extends string, TPayload> = ISerializedEventMetadata & {
  eventName: TEventName;
  payload: TPayload;
};

export abstract class Event<TEventName extends string, TPayload> implements IEvent {
  readonly eventId: string;
  readonly aggregateId: string;
  readonly occurredOn: Date;

  readonly correlationId?: string;
  readonly causationId?: string;
  readonly aggregateVersion?: number;

  abstract readonly eventName: TEventName;
  abstract readonly payload: Readonly<TPayload>;

  protected constructor(metadata: IEventMetadata) {
    this.eventId = metadata.eventId;
    this.aggregateId = metadata.aggregateId;
    this.occurredOn = metadata.occurredOn ?? new Date();
    this.correlationId = metadata.correlationId ?? undefined;
    this.causationId = metadata.causationId ?? undefined;
    this.aggregateVersion = metadata.aggregateVersion ?? 1;
  }

  protected freezePayload<T>(payload: T): Readonly<T> {
    return Object.freeze(payload);
  }

  toPrimitives(): SerializedEvent<TEventName, TPayload> {
    return {
      eventId: this.eventId,
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      occurredOn: this.occurredOn.toISOString(),
      correlationId: this.correlationId,
      causationId: this.causationId,
      aggregateVersion: this.aggregateVersion,
      payload: this.payload,
    };
  }
}

export type AnyEvent = Event<string, unknown>;

export type EventClass<TEvent extends AnyEvent, TSerialized> = {
  readonly EVENT_NAME: string;

  fromPrimitives(params: TSerialized): TEvent;
};
