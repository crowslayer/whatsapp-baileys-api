import { MessagePayload } from '@domain/messages/MessageTypes';

import { DomainEvent, IEventMetadata, SerializedDomainEvent } from '@shared/domain/DomainEvent';

type CreateProps = IEventMetadata & {
  payload: MessagePayload;
};

type MessageEventPrimitives = SerializedDomainEvent<
  typeof OutgoingWhatsAppMessage.EVENT_NAME,
  MessagePayload
>;

export class OutgoingWhatsAppMessage extends DomainEvent<
  typeof OutgoingWhatsAppMessage.EVENT_NAME,
  MessagePayload
> {
  static readonly EVENT_NAME = 'whatsapp.message.sended' as const;

  readonly eventName = OutgoingWhatsAppMessage.EVENT_NAME;

  readonly payload: Readonly<MessagePayload>;

  private constructor(props: CreateProps) {
    super(props);
    this.payload = this.freezePayload(props.payload);
  }

  static create(aggregateId: string, payload: MessagePayload): OutgoingWhatsAppMessage {
    return new OutgoingWhatsAppMessage({
      aggregateId,
      payload,
    });
  }

  static fromPrimitives(primitives: MessageEventPrimitives): OutgoingWhatsAppMessage {
    return new OutgoingWhatsAppMessage({
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
