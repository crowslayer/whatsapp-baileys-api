import { DomainEvent } from "@shared/domain/DomainEvent";

export class InstanceDisconnectedEvent implements DomainEvent {
    public readonly occurredOn: Date;
    public readonly eventName: string = 'instance.disconnected';
  
    constructor(
      public readonly aggregateId: string,
      public readonly payload: {
        instanceName: string;
        reason?: string;
      }
    ) {
      this.occurredOn = new Date();
    }
  }