import { DomainEvent, IEventMetadata, SerializedDomainEvent } from '@shared/domain/DomainEvent';

type MessagePayload = {
  instanceId: string;
  chatId: string;
  message: string;
};

type CreateProps = IEventMetadata & {
  payload: MessagePayload;
};

type MessageEventPrimitives = SerializedDomainEvent<
  typeof MessageReceivedEvent.EVENT_NAME,
  MessagePayload
>;

export class MessageReceivedEvent extends DomainEvent<
  typeof MessageReceivedEvent.EVENT_NAME,
  MessagePayload
> {
  static readonly EVENT_NAME = 'message.received' as const;

  readonly eventName = MessageReceivedEvent.EVENT_NAME;

  readonly payload: Readonly<MessagePayload>;

  private constructor(props: CreateProps) {
    super(props);
    this.payload = this.freezePayload(props.payload);
  }

  static create(aggregateId: string, payload: MessagePayload): MessageReceivedEvent {
    return new MessageReceivedEvent({
      aggregateId,
      payload,
    });
  }

  static fromPrimitives(primitives: MessageEventPrimitives): MessageReceivedEvent {
    return new MessageReceivedEvent({
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
