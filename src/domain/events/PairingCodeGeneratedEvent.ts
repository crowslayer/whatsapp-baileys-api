import { EventId } from '@domain/value-objects/EventId';

import { IDomainEvent } from '@shared/domain/DomainEvent';

export class PairingCodeGeneratedEvent implements IDomainEvent {
  public readonly eventName: string = 'pairingcode.generated';
  public readonly eventId: string = EventId.create().value;
  public readonly occurredOn: Date = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      pairingCode: string;
    }
  ) {}
}
