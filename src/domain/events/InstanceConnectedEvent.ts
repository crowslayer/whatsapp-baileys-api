import { DomainEvent, IEventMetadata, SerializedDomainEvent } from '@shared/domain/DomainEvent';

export type InstanceConnectedPayload = {
  instanceName: string;
  phoneNumber: string;
};

export type InstanceConnectedEventName = 'instance.connected';

export type InstanceConnectedEventPrimitives = SerializedDomainEvent<
  InstanceConnectedEventName,
  InstanceConnectedPayload
>;

type CreateProps = IEventMetadata & {
  payload: InstanceConnectedPayload;
};

export class InstanceConnectedEvent extends DomainEvent<
  InstanceConnectedEventName,
  InstanceConnectedPayload
> {
  static readonly EVENT_NAME = 'instance.connected' as const;

  readonly payload: Readonly<InstanceConnectedPayload>;

  readonly eventName = InstanceConnectedEvent.EVENT_NAME;

  private constructor(props: CreateProps) {
    super(props);
    this.payload = this.freezePayload(props.payload);
  }

  static create(aggregateId: string, payload: InstanceConnectedPayload): InstanceConnectedEvent {
    return new InstanceConnectedEvent({
      aggregateId,
      payload,
    });
  }

  static fromPrimitives(primitives: InstanceConnectedEventPrimitives): InstanceConnectedEvent {
    return new InstanceConnectedEvent({
      aggregateId: primitives.aggregateId,
      eventId: primitives.eventId,
      occurredOn: new Date(primitives.occurredOn),
      correlationId: primitives.correlationId,
      causationId: primitives.causationId,
      aggregateVersion: primitives.aggregateVersion,
      payload: primitives.payload,
    });
  }
}
