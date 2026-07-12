import { DomainEvent, IEventMetadata, SerializedDomainEvent } from '@shared/domain/DomainEvent';

type InstanceCreatedPayload = {
  name: string;
  phoneNumber?: string;
  webhookUrl?: string;
};

type CreateProps = IEventMetadata & {
  payload: InstanceCreatedPayload;
};

type InstanceCreatedEventPrimitives = SerializedDomainEvent<
  typeof InstanceCreatedEvent.EVENT_NAME,
  InstanceCreatedPayload
>;

export class InstanceCreatedEvent extends DomainEvent<
  typeof InstanceCreatedEvent.EVENT_NAME,
  InstanceCreatedPayload
> {
  static readonly EVENT_NAME = 'instance.created' as const;
  public readonly eventName = InstanceCreatedEvent.EVENT_NAME;
  readonly payload: Readonly<InstanceCreatedPayload>;

  private constructor(props: CreateProps) {
    super(props);
    this.payload = this.freezePayload(props.payload);
  }

  static create(aggregateId: string, payload: InstanceCreatedPayload): InstanceCreatedEvent {
    return new InstanceCreatedEvent({
      aggregateId,
      payload,
    });
  }

  static fromPrimitives(primitives: InstanceCreatedEventPrimitives): InstanceCreatedEvent {
    return new InstanceCreatedEvent({
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
