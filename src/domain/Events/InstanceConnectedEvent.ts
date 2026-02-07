import { DomainEvent } from '@shared/domain/DomainEvent';

export class InstanceConnectedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName: string = 'instance.connected';

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      instanceName: string;
      phoneNumber: string;
    }
  ) {
    this.occurredOn = new Date();
  }
}
