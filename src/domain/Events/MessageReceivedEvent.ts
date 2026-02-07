import { DomainEvent } from '@shared/domain/DomainEvent';

export class MessageReceivedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName: string = 'message.received';

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      messageId: string;
      from: string;
      message: string;
    }
  ) {
    this.occurredOn = new Date();
  }
}
