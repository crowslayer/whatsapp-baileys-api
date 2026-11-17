import { Event, IEventMetadata, SerializedEvent } from '@shared/domain/event/Event';
import { MessagePayload } from '@shared/domain/whatsapp/MessageTypes';

type CreateProps = IEventMetadata & {
  payload: MessagePayload;
};

type MessageEventPrimitives = SerializedEvent<
  typeof OutgoingWhatsAppMessage.EVENT_NAME,
  MessagePayload
>;

export class OutgoingWhatsAppMessage extends Event<
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

  static create(props: CreateProps): OutgoingWhatsAppMessage {
    return new OutgoingWhatsAppMessage(props);
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
