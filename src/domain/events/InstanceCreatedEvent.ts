import { IDomainEvent } from '@shared/domain/DomainEvent';

export class InstanceCreatedEvent implements IDomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName: string = 'instance.created';

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      phoneNumber?: string;
      webhookUrl?: string;
    }
  ) {
    this.occurredOn = new Date();
  }
}
