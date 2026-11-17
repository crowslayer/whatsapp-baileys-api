import { Event, IEventMetadata, SerializedEvent } from '@shared/domain/event/Event';

export type PairingCodePayload = {
  instanceId: string;
  pairingCode: string;
};

export type PairingCodePrimitives = SerializedEvent<
  typeof PairingCodeGeneratedEvent.EVENT_NAME,
  PairingCodePayload
>;

type CreateProps = IEventMetadata & {
  payload: PairingCodePayload;
};

export class PairingCodeGeneratedEvent extends Event<
  typeof PairingCodeGeneratedEvent.EVENT_NAME,
  PairingCodePayload
> {
  static readonly EVENT_NAME = 'pairingcode.generated' as const;

  public readonly eventName = PairingCodeGeneratedEvent.EVENT_NAME;

  readonly payload: Readonly<PairingCodePayload>;

  private constructor(props: CreateProps) {
    super(props);
    this.payload = this.freezePayload(props.payload);
  }

  static create(props: CreateProps): PairingCodeGeneratedEvent {
    return new PairingCodeGeneratedEvent(props);
  }

  static fromPrimitives(primitives: PairingCodePrimitives): PairingCodeGeneratedEvent {
    return new PairingCodeGeneratedEvent({
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
