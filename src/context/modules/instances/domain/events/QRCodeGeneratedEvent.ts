import { Event, IEventMetadata, SerializedEvent } from '@shared/domain/event/Event';

type QrCodePayload = {
  instanceId: string;
  qrCode: string;
  qrText: string;
};

type CreateProps = IEventMetadata & {
  payload: QrCodePayload;
};

type QrCodeEventPrimitives = SerializedEvent<typeof QRCodeGeneratedEvent.EVENT_NAME, QrCodePayload>;

export class QRCodeGeneratedEvent extends Event<
  typeof QRCodeGeneratedEvent.EVENT_NAME,
  QrCodePayload
> {
  static readonly EVENT_NAME = 'qrcode.generated' as const;

  readonly payload: Readonly<QrCodePayload>;

  readonly eventName = QRCodeGeneratedEvent.EVENT_NAME;

  private constructor(props: CreateProps) {
    super(props);
    this.payload = this.freezePayload(props.payload);
  }

  static create(props: CreateProps): QRCodeGeneratedEvent {
    return new QRCodeGeneratedEvent(props);
  }

  static fromPrimitives(primitives: QrCodeEventPrimitives): QRCodeGeneratedEvent {
    return new QRCodeGeneratedEvent({
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
