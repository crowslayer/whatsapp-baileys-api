import { AggregateRoot } from '@shared/domain/AggregateRoot';

import { CampaignError } from '@modules/campaign/domain/CampaignError';
import { CampaignId } from '@modules/campaign/domain/CampaignId';
import { CampaignName } from '@modules/campaign/domain/CampaignName';
import { CompletedAt } from '@modules/campaign/domain/CompletedAt';
import { Description } from '@modules/campaign/domain/Description';
import { LockedAt } from '@modules/campaign/domain/LockedAt';
import { LockExpiresAt } from '@modules/campaign/domain/LockExpiresAt';
import { Message } from '@modules/campaign/domain/Message';
import { ScheduledAt } from '@modules/campaign/domain/ScheduledAt';
import { StartedAt } from '@modules/campaign/domain/StartedAt';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { CreatedAt } from '@modules/shared/domain/CreatedAt';
import { UpdatedAt } from '@modules/shared/domain/UpdatedAt';

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
  name: CampaignName;
  description: Description;
  message: Message;
  recipients: ICampaignRecipient[];
  status: CampaignStatus;
  lockedBy: string | null;
  lockedAt: LockedAt | null;
  lockExpiresAt: LockExpiresAt | null;
  createdAt?: CreatedAt;
  updatedAt?: UpdatedAt;
  scheduledAt?: ScheduledAt;
  startedAt?: StartedAt;
  completedAt?: CompletedAt;
  cronExpression?: string;
}

type CampaignCreateProps = Omit<
  ICampaignProps,
  'campaignId' | 'status' | 'currentIndex' | 'lockedAt' | 'lockExpiresAt' | 'lockedBy'
>;

export class CampaignAggregate extends AggregateRoot<string> {
  private _campaignId: CampaignId;
  private _instanceId: InstanceId;
  private _name: CampaignName;
  private _description: Description;
  private _message: Message;
  private _recipients: ICampaignRecipient[];
  private _status: CampaignStatus;
  private _lockedBy: string | null = null;
  private _lockedAt: LockedAt | null = null;
  private _lockExpiresAt: LockExpiresAt | null = null;
  private _scheduledAt?: ScheduledAt;
  private _startedAt?: StartedAt;
  private _completedAt?: CompletedAt;
  private _cronExpression?: string;

  private constructor(props: ICampaignProps) {
    super(props.campaignId.value, props.createdAt?.value, props.updatedAt?.value);
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
    const aggregate = new CampaignAggregate({
      campaignId: CampaignId.create(),
      name: props.name,
      instanceId: props.instanceId,
      description: props.description,
      message: props.message,
      recipients: props.recipients,
      status: 'draft',
      lockedAt: null,
      lockedBy: null,
      lockExpiresAt: null,
    });
    aggregate.validate();
    return aggregate;
  }

  static restore(props: ICampaignProps): CampaignAggregate {
    return new CampaignAggregate(props);
  }

  start(): void {
    if (this._status !== 'draft' && this._status !== 'paused') {
      throw new CampaignError('Invalid state transition');
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

  schedule(schedule: ScheduledAt): void {
    if (this._status !== 'draft') {
      throw new CampaignError('Only draft campaigns can be scheduled');
    }

    this._status = 'scheduled';
    if (this._scheduledAt?.equals(schedule)) return;
    this._scheduledAt = schedule;
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
    if (props.message && !this._message.equals(props.message)) {
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

  get name(): CampaignName {
    return this._name;
  }

  get instanceId(): InstanceId {
    return this._instanceId;
  }

  get description(): Description {
    return this._description;
  }

  get message(): Message {
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

  get lockedAt(): LockedAt | null {
    return this._lockedAt;
  }

  get lockExpiresAt(): LockExpiresAt | null {
    return this._lockExpiresAt;
  }

  get scheduledAt(): ScheduledAt | undefined {
    return this._scheduledAt;
  }

  get startedAt(): StartedAt | undefined {
    return this._startedAt;
  }

  get completedAt(): CompletedAt | undefined {
    return this._completedAt;
  }

  get cronExpression(): string | undefined {
    return this._cronExpression;
  }

  protected validate(): void {
    if (this._recipients.length >= 5000) {
      throw new CampaignError('Recipientes must be minus to 50000');
    }
  }
}
