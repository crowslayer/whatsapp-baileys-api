import { Event, IEventMetadata, SerializedEvent } from '@shared/domain/event/Event';
import { MessagePayload } from '@shared/domain/whatsapp/MessageTypes';

type CreateProps = IEventMetadata & {
  payload: MessagePayload;
};

type MessageEventPrimitives = SerializedEvent<
  typeof IncomingWhatsAppMessage.EVENT_NAME,
  MessagePayload
>;

export class IncomingWhatsAppMessage extends Event<
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

  static create(props: CreateProps): IncomingWhatsAppMessage {
    return new IncomingWhatsAppMessage(props);
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
