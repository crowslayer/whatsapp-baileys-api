import { DomainEvent, IEventMetadata, SerializedDomainEvent } from '@shared/domain/DomainEvent';

type QrCodePayload = {
  instanceId: string;
  qrCode: string;
  qrText: string;
};

type CreateProps = IEventMetadata & {
  payload: QrCodePayload;
};

type QrCodeEventPrimitives = SerializedDomainEvent<
  typeof QRCodeGeneratedEvent.EVENT_NAME,
  QrCodePayload
>;

export class QRCodeGeneratedEvent extends DomainEvent<
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

  static create(aggregateId: string, payload: QrCodePayload): QRCodeGeneratedEvent {
    return new QRCodeGeneratedEvent({
      aggregateId,
      payload,
    });
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
