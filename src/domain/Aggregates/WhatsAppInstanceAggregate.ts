import { AggregateRoot } from '@shared/domain/AggregateRoot';
import { ValidationError } from '@shared/infrastructure/ErrorHandler';
import { PairingCodeGeneratedEvent } from '@domain/Events/PairingCodeGeneratedEvent';
import { QRCodeGeneratedEvent } from '@domain/Events/QRCodeGeneratedEvent';
import { InstanceConnectedEvent } from '@domain/Events/InstanceConnectedEvent';
import { InstanceDisconnectedEvent } from '@domain/Events/InstanceDisconnectedEvent';
import { ConnectionStatus, ConnectionStatusEnum } from '@domain/Value-Objects/ConnectionStatus';
import { InstanceId } from '@domain/Value-Objects/InstanceId';
import { PhoneNumber } from '@domain/Value-Objects/PhoneNumber';


export interface WhatsAppInstanceProps {
  instanceId: InstanceId;
  name: string;
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
  private _name: string;
  private _status: ConnectionStatus;
  private _phoneNumber?: PhoneNumber;
  private _qrCode?: string;
  private _qrText?: string;
  private _pairingCode?: string;
  private _webhookUrl?: string;
  private _sessionData?: any;
  private _lastConnectedAt?: Date;

  private constructor(props: WhatsAppInstanceProps) {
    super(
      props.instanceId.value,
      props.createdAt,
      props.updatedAt
    );
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

  static create(name: string, webhookUrl?: string): WhatsAppInstanceAggregate {
    const instanceId = InstanceId.create();
    const status = ConnectionStatus.disconnected();

    const instance = new WhatsAppInstanceAggregate({
      instanceId,
      name,
      status,
      webhookUrl,
    });

    return instance;
  }

  static restore(props: WhatsAppInstanceProps): WhatsAppInstanceAggregate {
    return new WhatsAppInstanceAggregate(props);
  }

  // Getters
  get instanceId(): string {
    return this._id;
  }

  get name(): string {
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
        instanceName: this._name,
        phoneNumber: phoneNumber,
      })
    );
  }

  disconnect(reason?: string): void {
    this._status = ConnectionStatus.disconnected();

    this.addDomainEvent(
      new InstanceDisconnectedEvent(this.instanceId, {
        instanceName: this._name,
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
    if (!this._name || this._name.trim().length === 0) {
      throw new ValidationError('Instance name is required');
    }

    if (this._name.length > 100) {
      throw new ValidationError('Instance name must be less than 100 characters');
    }
  }

  toJSON() {
    return {
      instanceId: this.instanceId,
      name: this._name,
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