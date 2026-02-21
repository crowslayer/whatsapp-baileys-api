export interface IDomainEvent {
  occurredOn: Date;
  eventName: string;
  aggregateId: string;
  payload: Record<string, unknown>;
}
