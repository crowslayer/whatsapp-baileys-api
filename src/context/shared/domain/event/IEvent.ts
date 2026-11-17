export interface IEvent {
  readonly eventId: string;
  readonly eventName: string;
  readonly aggregateId: string;
  readonly occurredOn: Date;

  readonly correlationId?: string;
  readonly causationId?: string;
  readonly aggregateVersion?: number;
}
