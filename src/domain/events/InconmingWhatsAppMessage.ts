import { DomainEvent, IEventMetadata, SerializedDomainEvent } from '@shared/domain/DomainEvent';

type MessagePayload = {
  instanceId: string;
  chatId: string;
  messageId: string;
  from: string;
  text: string;
  timestamp: Date;
};

type CreateProps = IEventMetadata & {
  payload: MessagePayload;
};

type MessageEventPrimitives = SerializedDomainEvent<
  typeof InconmingWhatsAppMessage.EVENT_NAME,
  MessagePayload
>;

export class InconmingWhatsAppMessage extends DomainEvent<
  typeof InconmingWhatsAppMessage.EVENT_NAME,
  MessagePayload
> {
  static readonly EVENT_NAME = 'message.received' as const;

  readonly eventName = InconmingWhatsAppMessage.EVENT_NAME;

  readonly payload: Readonly<MessagePayload>;

  private constructor(props: CreateProps) {
    super(props);
    this.payload = this.freezePayload(props.payload);
  }

  static create(aggregateId: string, payload: MessagePayload): InconmingWhatsAppMessage {
    return new InconmingWhatsAppMessage({
      aggregateId,
      payload,
    });
  }

  static fromPrimitives(primitives: MessageEventPrimitives): InconmingWhatsAppMessage {
    return new InconmingWhatsAppMessage({
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
