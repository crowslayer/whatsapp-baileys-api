import { IDomainEvent } from '@shared/domain/DomainEvent';

export class PairingCodeGeneratedEvent implements IDomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName: string = 'pairingcode.generated';

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      pairingCode: string;
    }
  ) {
    this.occurredOn = new Date();
  }
}
