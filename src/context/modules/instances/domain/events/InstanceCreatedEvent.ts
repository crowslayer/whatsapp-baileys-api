import { Event, IEventMetadata, SerializedEvent } from '@shared/domain/event/Event';

type InstanceCreatedPayload = {
  name: string;
  phoneNumber?: string;
  status?: string;
  webhookUrl?: string;
  createdAt: string;
  lastConnectedAt?: string;
};

type CreateProps = IEventMetadata & {
  payload: InstanceCreatedPayload;
};

type InstanceCreatedEventPrimitives = SerializedEvent<
  typeof InstanceCreatedEvent.EVENT_NAME,
  InstanceCreatedPayload
>;

export class InstanceCreatedEvent extends Event<
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

  static create(props: CreateProps): InstanceCreatedEvent {
    return new InstanceCreatedEvent(props);
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
