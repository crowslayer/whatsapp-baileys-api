import { AggregateRoot } from '@shared/domain/AggregateRoot';
import { ValidationError } from '@shared/domain/error/ValidationError';
import { EventId } from '@shared/domain/event/EventId';

import { ConnectionStatus } from '@modules/instances/domain/ConnectionStatus';
import { InstanceConnectedEvent } from '@modules/instances/domain/events/InstanceConnectedEvent';
import { InstanceCreatedEvent } from '@modules/instances/domain/events/InstanceCreatedEvent';
import { InstanceDisconnectedEvent } from '@modules/instances/domain/events/InstanceDisconnectedEvent';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { LastConnectedAt } from '@modules/instances/domain/LastConnectedAt';
import { Name } from '@modules/instances/domain/Name';
import { PhoneNumber } from '@modules/instances/domain/PhoneNumber';
import { CreatedAt } from '@modules/shared/domain/CreatedAt';
import { UpdatedAt } from '@modules/shared/domain/UpdatedAt';

export interface IInstanceProps {
  instanceId: InstanceId;
  name: Name;
  status: ConnectionStatus;
  phoneNumber?: PhoneNumber;
  webhookUrl?: string;
  createdAt?: CreatedAt;
  updatedAt?: UpdatedAt;
  lastConnectedAt?: LastConnectedAt;
}

export type CreateInstanceProps = Omit<
  IInstanceProps,
  'instanceId' | 'createdAt' | 'updatedAt' | 'status'
>;

type InstancePrimitives = {
  instanceId: string;
  name: string;
  status: string;
  phoneNumber?: string;
  webhookUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  lastConnectedAt?: Date;
};

export class InstanceAggregate extends AggregateRoot<string> {
  private _name: Name;
  private _status: ConnectionStatus;
  private _phoneNumber?: PhoneNumber;
  private _webhookUrl?: string;
  private _lastConnectedAt?: LastConnectedAt;

  private constructor(props: IInstanceProps) {
    super(props.instanceId.value, props.createdAt?.value, props.updatedAt?.value);
    this._name = props.name;
    this._status = props.status;
    this._phoneNumber = props.phoneNumber;
    this._webhookUrl = props.webhookUrl;
    this._lastConnectedAt = props.lastConnectedAt;
    this.validate();
  }

  static create(props: CreateInstanceProps): InstanceAggregate {
    const instanceId = InstanceId.create();

    const instance = new InstanceAggregate({
      instanceId,
      name: props.name,
      status: ConnectionStatus.disconnected(),
      webhookUrl: props.webhookUrl || undefined,
      phoneNumber: props.phoneNumber || undefined,
      lastConnectedAt: props.lastConnectedAt || undefined,
      createdAt: CreatedAt.create(new Date()),
      updatedAt: UpdatedAt.create(new Date()),
    });

    instance.addDomainEvent(
      InstanceCreatedEvent.create({
        aggregateId: instance.id,
        eventId: EventId.create().value,
        payload: {
          name: instance.name.value,
          webhookUrl: instance.webhookUrl,
          status: instance.status.value,
          createdAt: instance.createdAt.toISOString(),
        },
      })
    );

    return instance;
  }

  static restore(props: IInstanceProps): InstanceAggregate {
    return new InstanceAggregate(props);
  }

  static fromPrimitives(props: InstancePrimitives): InstanceAggregate {
    return new InstanceAggregate({
      instanceId: InstanceId.fromString(props.instanceId),
      name: Name.create(props.name),
      status: ConnectionStatus.fromValue(props.status),
      phoneNumber: props.phoneNumber ? PhoneNumber.create(props.phoneNumber) : undefined,
      webhookUrl: props.webhookUrl,
      lastConnectedAt: props.lastConnectedAt
        ? LastConnectedAt.create(props.lastConnectedAt)
        : undefined,
      createdAt: CreatedAt.create(props.createdAt),
      updatedAt: UpdatedAt.create(props.updatedAt),
    });
  }

  // Getters
  get instanceId(): string {
    return this._id;
  }

  get name(): Name {
    return this._name;
  }

  get status(): ConnectionStatus {
    return this._status;
  }

  get phoneNumber(): PhoneNumber | undefined {
    return this._phoneNumber;
  }

  get webhookUrl(): string | undefined {
    return this._webhookUrl;
  }

  get lastConnectedAt(): LastConnectedAt | undefined {
    return this._lastConnectedAt;
  }

  // Business Logic
  connect(phoneNumber: string): void {
    if (this._status.isConnected()) return;

    this._phoneNumber = PhoneNumber.create(phoneNumber);
    this._status = ConnectionStatus.connected();
    this._lastConnectedAt = LastConnectedAt.create(new Date());

    this.addDomainEvent(
      InstanceConnectedEvent.create({
        aggregateId: this.instanceId,
        eventId: EventId.create().value,
        payload: {
          phoneNumber,
          instanceId: this._id,
          status: this.status.value,
          lastConnectedAt: this.lastConnectedAt?.toISOString(),
          updatedAt: this.updatedAt.toISOString(),
        },
      })
    );
  }

  disconnect(reason?: string): void {
    if (!this._status.isConnected()) return;

    this._status = ConnectionStatus.disconnected();

    this.addDomainEvent(
      InstanceDisconnectedEvent.create({
        aggregateId: this._id,
        eventId: EventId.create().value,
        payload: {
          name: this._name.value,
          instanceId: this._id,
          reason,
          status: this.status.value,
          updatedAt: this.updatedAt.toISOString(),
          lastConnectedAt: this.lastConnectedAt?.toISOString(),
        },
      })
    );
  }

  canSendMessages(): boolean {
    return this._status.isConnected();
  }

  protected validate(): void {
    if (!this._name.value || this._name.value.trim().length === 0) {
      throw new ValidationError([{ field: 'name', message: 'Instance name is required' }]);
    }

    if (this._name.value.length > 100) {
      throw new ValidationError([
        { field: 'name', message: 'Instance name must be less than 100 characters' },
      ]);
    }
  }

  toPrimitives(): InstancePrimitives {
    return {
      instanceId: this.instanceId,
      name: this._name.value,
      status: this._status.value,
      phoneNumber: this._phoneNumber?.value,
      webhookUrl: this._webhookUrl,
      lastConnectedAt: this._lastConnectedAt?.value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
