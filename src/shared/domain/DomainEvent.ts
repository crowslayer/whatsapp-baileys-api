export interface DomainEvent {
    occurredOn: Date;
    eventName: string;
    aggregateId: string;
    payload: any;
  }