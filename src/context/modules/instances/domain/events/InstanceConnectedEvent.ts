import { Event, IEventMetadata, SerializedEvent } from '@shared/domain/event/Event';

export type InstanceConnectedPayload = {
  instanceId: string;
  phoneNumber: string;
  status?: string;
  lastConnectedAt?: string;
  updatedAt?: string;
};

export type InstanceConnectedEventName = 'instance.connected';

export type InstanceConnectedEventPrimitives = SerializedEvent<
  typeof InstanceConnectedEvent.EVENT_NAME,
  InstanceConnectedPayload
>;

type CreateProps = IEventMetadata & {
  payload: InstanceConnectedPayload;
};

export class InstanceConnectedEvent extends Event<
  typeof InstanceConnectedEvent.EVENT_NAME,
  InstanceConnectedPayload
> {
  static readonly EVENT_NAME = 'instance.connected' as const;

  readonly payload: Readonly<InstanceConnectedPayload>;

  readonly eventName = InstanceConnectedEvent.EVENT_NAME;

  private constructor(props: CreateProps) {
    super(props);
    this.payload = this.freezePayload(props.payload);
  }

  static create(props: CreateProps): InstanceConnectedEvent {
    return new InstanceConnectedEvent(props);
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
