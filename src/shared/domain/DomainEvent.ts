export interface IDomainEvent {
  occurredOn: Date;
  eventName: string;
  aggregateId: string;
  payload: any;
}
