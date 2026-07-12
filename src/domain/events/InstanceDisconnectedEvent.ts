import { DomainEvent, IEventMetadata, SerializedDomainEvent } from '@shared/domain/DomainEvent';

export type InstanceDisconnectedPayload = {
  instanceId: string;
  instanceName: string;
  reason?: string;
};

export type InstanceDisconnectedPrimitives = SerializedDomainEvent<
  typeof InstanceDisconnectedEvent.EVENT_NAME,
  InstanceDisconnectedPayload
>;

type CreateProps = IEventMetadata & {
  payload: InstanceDisconnectedPayload;
};

export class InstanceDisconnectedEvent extends DomainEvent<
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

  static create(
    aggregateId: string,
    payload: InstanceDisconnectedPayload
  ): InstanceDisconnectedEvent {
    return new InstanceDisconnectedEvent({
      aggregateId,
      payload,
    });
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
