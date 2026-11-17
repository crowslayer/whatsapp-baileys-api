import { Event, IEventMetadata, SerializedEvent } from '@shared/domain/event/Event';

export type InstanceDisconnectedPayload = {
  instanceId: string;
  name: string;
  reason?: string;
  status?: string;
  lastConnectedAt?: string;
  updatedAt?: string;
};

export type InstanceDisconnectedPrimitives = SerializedEvent<
  typeof InstanceDisconnectedEvent.EVENT_NAME,
  InstanceDisconnectedPayload
>;

type CreateProps = IEventMetadata & {
  payload: InstanceDisconnectedPayload;
};

export class InstanceDisconnectedEvent extends Event<
  typeof InstanceDisconnectedEvent.EVENT_NAME,
  InstanceDisconnectedPayload
> {
  static readonly EVENT_NAME = 'instance.disconnected' as const;

  public readonly eventName = InstanceDisconnectedEvent.EVENT_NAME;

  readonly payload: Readonly<InstanceDisconnectedPayload>;

  private constructor(props: CreateProps) {
    super(props);
    this.payload = this.freezePayload(props.payload);
  }

  static create(props: CreateProps): InstanceDisconnectedEvent {
    return new InstanceDisconnectedEvent(props);
  }

  static fromPrimitives(primitives: InstanceDisconnectedPrimitives): InstanceDisconnectedEvent {
    return new InstanceDisconnectedEvent({
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
