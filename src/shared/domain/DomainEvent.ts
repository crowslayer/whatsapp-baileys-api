import { EventId } from '@domain/value-objects/EventId';

import { AnyDomainEvent } from '@shared/domain/IDomainEventSubscriber';

export interface IEventMetadata {
  eventId?: string;
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

export type SerializedDomainEvent<
  TEventName extends string,
  TPayload,
> = ISerializedEventMetadata & {
  eventName: TEventName;
  payload: TPayload;
};

export interface IDomainEvent {
  readonly eventId: string;
  readonly eventName: string;
  readonly aggregateId: string;
  readonly occurredOn: Date;

  readonly correlationId?: string;
  readonly causationId?: string;
  readonly aggregateVersion?: number;
}

export abstract class DomainEvent<TEventName extends string, TPayload> implements IDomainEvent {
  readonly eventId: string;
  readonly aggregateId: string;
  readonly occurredOn: Date;

  readonly correlationId?: string;
  readonly causationId?: string;
  readonly aggregateVersion?: number;

  abstract readonly eventName: TEventName;
  abstract readonly payload: Readonly<TPayload>;

  protected constructor(metadata: IEventMetadata) {
    this.eventId = metadata.eventId ?? EventId.create().value;
    this.aggregateId = metadata.aggregateId;
    this.occurredOn = metadata.occurredOn ?? new Date();
    this.correlationId = metadata.correlationId ?? undefined;
    this.causationId = metadata.causationId ?? undefined;
    this.aggregateVersion = metadata.aggregateVersion ?? 1;
  }

  protected freezePayload<T>(payload: T): Readonly<T> {
    return Object.freeze(payload);
  }

  toPrimitives(): SerializedDomainEvent<TEventName, TPayload> {
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

export type DomainEventClass<TEvent extends AnyDomainEvent, TSerialized> = {
  readonly EVENT_NAME: string;

  fromPrimitives(params: TSerialized): TEvent;
};
