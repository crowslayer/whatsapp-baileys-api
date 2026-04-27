import { CampaignId } from '@domain/campaign/CampaignId';
import { Description } from '@domain/campaign/Description';
import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';

import { AggregateRoot } from '@shared/domain/AggregateRoot';

export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed';

export type RecipientStatus = 'pending' | 'sent' | 'failed';

export interface ICampaignRecipient {
  jid: string;
  status: RecipientStatus;
  attempts: number;
  lastError?: string;
  retryAt?: Date | null;
}

export interface ICampaignProps {
  campaignId: CampaignId;
  instanceId: InstanceId;
  name: Name;
  description: Description;
  message: string;
  recipients: ICampaignRecipient[];
  status: CampaignStatus;
  lockedBy?: string | null;
  lockedAt?: Date | null;
  lockExpiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cronExpression?: string;
}

type CampaignCreateProps = Omit<ICampaignProps, 'campaignId' | 'status' | 'currentIndex'>;

export class CampaignAggregate extends AggregateRoot<string> {
  private _campaignId: CampaignId;
  private _instanceId: InstanceId;
  private _name: Name;
  private _description: Description;
  private _message: string;
  private _recipients: ICampaignRecipient[];
  private _status: CampaignStatus;
  private _lockedBy: string | null = null;
  private _lockedAt: Date | null = null;
  private _lockExpiresAt: Date | null = null;
  private _scheduledAt?: Date;
  private _startedAt?: Date;
  private _completedAt?: Date;
  private _cronExpression?: string;

  private constructor(props: ICampaignProps) {
    super(props.campaignId.value, props.createdAt, props.updatedAt);
    this._campaignId = props.campaignId;
    this._name = props.name;
    this._instanceId = props.instanceId;
    this._description = props.description;
    this._message = props.message;
    this._recipients = props.recipients;
    this._status = props.status;
    this._lockedBy = props.lockedBy ?? null;
    this._lockedAt = props.lockedAt ?? null;
    this._lockExpiresAt = props.lockExpiresAt ?? null;
    this._scheduledAt = props.scheduledAt;
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
    this._cronExpression = props.cronExpression ?? undefined;
  }

  static create(props: CampaignCreateProps): CampaignAggregate {
    return new CampaignAggregate({
      campaignId: CampaignId.create(),
      name: props.name,
      instanceId: props.instanceId,
      description: props.description,
      message: props.message,
      recipients: props.recipients,
      status: 'draft',
    });
  }

  static restore(props: ICampaignProps): CampaignAggregate {
    return new CampaignAggregate(props);
  }

  start(): void {
    if (this._status !== 'draft' && this._status !== 'paused') {
      throw new Error('Invalid state transition');
    }

    this._status = 'running';
  }

  pause(): void {
    if (this._status !== 'running') return;
    this._status = 'paused';
  }

  complete(): void {
    if (this._status !== 'running') return;
    this._status = 'completed';
  }

  schedule(date: Date): void {
    if (this._status !== 'draft') {
      throw new Error('Only draft campaigns can be scheduled');
    }

    this._status = 'scheduled';
    this._scheduledAt = date;
  }

  updated(props: Partial<CampaignCreateProps>): void {
    if (props.instanceId && !this._instanceId.equals(props.instanceId)) {
      this._instanceId = props.instanceId;
    }
    if (props.name && !this._name.equals(props.name)) {
      this._name = props.name;
    }
    if (props.description && !this._description.equals(props.description)) {
      this._description = props.description;
    }
    if (props.message) {
      this._message = props.message;
    }
    if (props.recipients && Array.isArray(props.recipients)) {
      this._recipients = props.recipients;
    }
  }

  get id(): string {
    return this._id;
  }

  get campaignId(): CampaignId {
    return this._campaignId;
  }

  get name(): Name {
    return this._name;
  }

  get instanceId(): InstanceId {
    return this._instanceId;
  }

  get description(): Description {
    return this._description;
  }

  get message(): string {
    return this._message;
  }

  get status(): CampaignStatus {
    return this._status;
  }

  get recipients(): ICampaignRecipient[] {
    return this._recipients;
  }

  get lockedBy(): string | null {
    return this._lockedBy;
  }

  get lockedAt(): Date | null {
    return this._lockedAt;
  }

  get lockExpiresAt(): Date | null {
    return this._lockExpiresAt;
  }

  get scheduledAt(): Date | undefined {
    return this._scheduledAt;
  }

  get startedAt(): Date | undefined {
    return this._startedAt;
  }

  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  get cronExpression(): string | undefined {
    return this._cronExpression;
  }

  protected validate(): void {
    if (this._message.length > 1000) {
      throw new Error(
        'The maximum length of the allowed marketing message is less than 1000 characters.'
      );
    }

    if (this._recipients.length >= 5000) {
      throw new Error('Recipientes must be menor to 50000');
    }
  }
}
