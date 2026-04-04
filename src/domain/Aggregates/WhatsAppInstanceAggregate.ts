import { InstanceConnectedEvent } from '@domain/events/InstanceConnectedEvent';
import { InstanceDisconnectedEvent } from '@domain/events/InstanceDisconnectedEvent';
import { PairingCodeGeneratedEvent } from '@domain/events/PairingCodeGeneratedEvent';
import { QRCodeGeneratedEvent } from '@domain/events/QRCodeGeneratedEvent';
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
  qrCode?: string;
  qrText?: string;
  pairingCode?: string;
  webhookUrl?: string;
  sessionData?: any;
  createdAt?: Date;
  updatedAt?: Date;
  lastConnectedAt?: Date;
}

export class WhatsAppInstanceAggregate extends AggregateRoot<string> {
  private _name: Name;
  private _status: ConnectionStatus;
  private _phoneNumber?: PhoneNumber;
  private _qrCode?: string;
  private _qrText?: string;
  private _pairingCode?: string;
  private _webhookUrl?: string;
  private _sessionData?: any;
  private _lastConnectedAt?: Date;

  private constructor(props: IWhatsAppInstanceProps) {
    super(props.instanceId.value, props.createdAt, props.updatedAt);
    this._name = props.name;
    this._status = props.status;
    this._phoneNumber = props.phoneNumber;
    this._qrCode = props.qrCode;
    this._qrText = props.qrText;
    this._pairingCode = props.pairingCode;
    this._webhookUrl = props.webhookUrl;
    this._sessionData = props.sessionData;
    this._lastConnectedAt = props.lastConnectedAt;
    this.validate();
  }

  static create(name: Name, webhookUrl?: string): WhatsAppInstanceAggregate {
    const instanceId = InstanceId.create();
    const status = ConnectionStatus.disconnected();

    return new WhatsAppInstanceAggregate({
      instanceId,
      name,
      status,
      webhookUrl,
    });
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

  get qrCode(): string | undefined {
    return this._qrCode;
  }

  get qrText(): string | undefined {
    return this._qrText;
  }

  get pairingCode(): string | undefined {
    return this._pairingCode;
  }

  get webhookUrl(): string | undefined {
    return this._webhookUrl;
  }

  get sessionData(): any {
    return this._sessionData;
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
      new InstanceConnectedEvent(this.instanceId, {
        instanceName: this._name.value,
        phoneNumber,
      })
    );
  }

  disconnect(reason?: string): void {
    this._status = ConnectionStatus.disconnected();
    this._phoneNumber = undefined;
    this._qrCode = '';
    this._qrText = '';

    this.addDomainEvent(
      new InstanceDisconnectedEvent(this.instanceId, {
        instanceName: this._name.value,
        reason,
      })
    );
  }

  generateQRCode(qrCode: string, qrText: string): void {
    this._qrCode = qrCode;
    this._qrText = qrText;
    this._status = ConnectionStatus.qrReady();

    this.addDomainEvent(
      new QRCodeGeneratedEvent(this.instanceId, {
        qrCode,
      })
    );
  }

  generatePairingCode(pairingCode: string): void {
    this._pairingCode = pairingCode;
    this._status = ConnectionStatus.pairingCodeReady();

    this.addDomainEvent(
      new PairingCodeGeneratedEvent(this.instanceId, {
        pairingCode,
      })
    );
  }

  updateStatus(status: ConnectionStatusEnum): void {
    this._status = ConnectionStatus.create(status);
  }

  updateSessionData(sessionData: any): void {
    this._sessionData = sessionData;
  }

  canSendMessages(): boolean {
    return this._status.canSendMessages();
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
      qrCode: this._qrCode,
      qrText: this._qrText,
      pairingCode: this._pairingCode,
      webhookUrl: this._webhookUrl,
      lastConnectedAt: this._lastConnectedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
