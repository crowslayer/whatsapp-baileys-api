import { DomainEvent, IEventMetadata, SerializedDomainEvent } from '@shared/domain/DomainEvent';

type CampaignInitializePayload = {
  campaignId: string;
  instanceId: string;
  workerId: string;
};

type CreateProps = IEventMetadata & {
  payload: CampaignInitializePayload;
};

type CampaignEventPrimitives = SerializedDomainEvent<
  typeof CampaignInitializeEvent.EVENT_NAME,
  CampaignInitializePayload
>;

export class CampaignInitializeEvent extends DomainEvent<
  typeof CampaignInitializeEvent.EVENT_NAME,
  CampaignInitializePayload
> {
  static readonly EVENT_NAME = 'campaign.initialize' as const;

  readonly payload: Readonly<CampaignInitializePayload>;

  readonly eventName = CampaignInitializeEvent.EVENT_NAME;

  private constructor(props: CreateProps) {
    super(props);
    this.payload = this.freezePayload(props.payload);
  }

  static create(aggregateId: string, payload: CampaignInitializePayload): CampaignInitializeEvent {
    return new CampaignInitializeEvent({
      aggregateId,
      payload,
    });
  }

  static fromPrimitives(primitives: CampaignEventPrimitives): CampaignInitializeEvent {
    return new CampaignInitializeEvent({
      aggregateId: primitives.aggregateId,
      eventId: primitives.eventId,
      occurredOn: new Date(primitives.occurredOn),
      correlationId: primitives.correlationId,
      causationId: primitives.causationId,
      aggregateVersion: primitives.aggregateVersion,
      payload: primitives.payload,
    });
  }
}
