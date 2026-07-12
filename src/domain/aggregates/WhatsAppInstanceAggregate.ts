import { InstanceConnectedEvent } from '@domain/events/InstanceConnectedEvent';
import { InstanceCreatedEvent } from '@domain/events/InstanceCreatedEvent';
import { InstanceDisconnectedEvent } from '@domain/events/InstanceDisconnectedEvent';
import { ConnectionStatus, ConnectionStatusEnum } from '@domain/value-objects/ConnectionStatus';
import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';
import { PhoneNumber } from '@domain/value-objects/PhoneNumber';

import { AggregateRoot } from '@shared/domain/AggregateRoot';
import { ValidationError } from '@shared/infrastructure/errors/ValidationError';

export interface IWhatsAppInstanceProps {
  instanceId: InstanceId;
  name: Name;
  status: ConnectionStatus;
  phoneNumber?: PhoneNumber;
  webhookUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastConnectedAt?: Date;
}

export class WhatsAppInstanceAggregate extends AggregateRoot<string> {
  private _name: Name;
  private _status: ConnectionStatus;
  private _phoneNumber?: PhoneNumber;
  private _webhookUrl?: string;
  private _lastConnectedAt?: Date;

  private constructor(props: IWhatsAppInstanceProps) {
    super(props.instanceId.value, props.createdAt, props.updatedAt);
    this._name = props.name;
    this._status = props.status;
    this._phoneNumber = props.phoneNumber;
    this._webhookUrl = props.webhookUrl;
    this._lastConnectedAt = props.lastConnectedAt;
    this.validate();
  }

  static create(name: Name, webhookUrl?: string): WhatsAppInstanceAggregate {
    const instanceId = InstanceId.create();
    const status = ConnectionStatus.disconnected();

    const instance = new WhatsAppInstanceAggregate({
      instanceId,
      name,
      status,
      webhookUrl,
    });

    instance.addDomainEvent(
      InstanceCreatedEvent.create(instanceId.value, {
        name: name.value,
        webhookUrl,
      })
    );

    return instance;
  }

  static restore(props: IWhatsAppInstanceProps): WhatsAppInstanceAggregate {
    return new WhatsAppInstanceAggregate(props);
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

  get lastConnectedAt(): Date | undefined {
    return this._lastConnectedAt;
  }

  // Business Logic
  connect(phoneNumber: string): void {
    this._phoneNumber = PhoneNumber.create(phoneNumber);
    this._status = ConnectionStatus.connected();
    this._lastConnectedAt = new Date();

    this.addDomainEvent(
      InstanceConnectedEvent.create(this.instanceId, {
        instanceId: this._id,
        phoneNumber,
      })
    );
  }

  disconnect(reason?: string): void {
    this._status = ConnectionStatus.disconnected();

    this.addDomainEvent(
      new InstanceDisconnectedEvent(this.instanceId, {
        instanceName: this._name.value,
        reason,
      })
    );
  }

  updateStatus(status: ConnectionStatusEnum): void {
    this._status = ConnectionStatus.create(status);
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

  toJSON() {
    return {
      instanceId: this.instanceId,
      name: this._name.value,
      status: this._status.value,
      phoneNumber: this._phoneNumber?.value,
      webhookUrl: this._webhookUrl,
      lastConnectedAt: this._lastConnectedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
