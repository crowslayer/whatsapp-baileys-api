import { MessagePayload } from '@domain/messages/MessageTypes';

import { DomainEvent, IEventMetadata, SerializedDomainEvent } from '@shared/domain/DomainEvent';

type CreateProps = IEventMetadata & {
  payload: MessagePayload;
};

type MessageEventPrimitives = SerializedDomainEvent<
  typeof IncomingWhatsAppMessage.EVENT_NAME,
  MessagePayload
>;

export class IncomingWhatsAppMessage extends DomainEvent<
  typeof IncomingWhatsAppMessage.EVENT_NAME,
  MessagePayload
> {
  static readonly EVENT_NAME = 'whatsapp.message.received' as const;

  readonly eventName = IncomingWhatsAppMessage.EVENT_NAME;

  readonly payload: Readonly<MessagePayload>;

  private constructor(props: CreateProps) {
    super(props);
    this.payload = this.freezePayload(props.payload);
  }

  static create(aggregateId: string, payload: MessagePayload): IncomingWhatsAppMessage {
    return new IncomingWhatsAppMessage({
      aggregateId,
      payload,
    });
  }

  static fromPrimitives(primitives: MessageEventPrimitives): IncomingWhatsAppMessage {
    return new IncomingWhatsAppMessage({
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
