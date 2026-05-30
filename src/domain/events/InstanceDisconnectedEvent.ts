import { EventId } from '@domain/value-objects/EventId';

import { IDomainEvent } from '@shared/domain/DomainEvent';

export class InstanceDisconnectedEvent implements IDomainEvent {
  public readonly eventName: string = 'instance.disconnected';
  public readonly eventId: string = EventId.create().value;
  public readonly occurredOn: Date = new Date();

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      instanceName: string;
      reason?: string;
    }
  ) {}
}
