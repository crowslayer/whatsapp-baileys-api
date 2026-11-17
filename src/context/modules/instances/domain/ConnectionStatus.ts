import { ValidationError } from '@shared/domain/error/ValidationError';
import { EnumValueObject } from '@shared/domain/value-object/EnumValueObject';
import { ValueObjectValidationError } from '@shared/domain/value-object/ValueObjectValidationError ';

export enum ConnectionStatusEnum {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  QR_READY = 'qr_ready',
  PAIRING_CODE_READY = 'pairing_code_ready',
  ERROR = 'error',
}

export class ConnectionStatus extends EnumValueObject<ConnectionStatusEnum> {
  private constructor(value: ConnectionStatusEnum) {
    super(value, Object.values(ConnectionStatusEnum));
  }

  static create(value: ConnectionStatusEnum): ConnectionStatus {
    return new ConnectionStatus(value);
  }

  static disconnected(): ConnectionStatus {
    return new ConnectionStatus(ConnectionStatusEnum.DISCONNECTED);
  }

  static connecting(): ConnectionStatus {
    return new ConnectionStatus(ConnectionStatusEnum.CONNECTING);
  }

  static connected(): ConnectionStatus {
    return new ConnectionStatus(ConnectionStatusEnum.CONNECTED);
  }

  static qrReady(): ConnectionStatus {
    return new ConnectionStatus(ConnectionStatusEnum.QR_READY);
  }

  static pairingCodeReady(): ConnectionStatus {
    return new ConnectionStatus(ConnectionStatusEnum.PAIRING_CODE_READY);
  }

  static error(): ConnectionStatus {
    return new ConnectionStatus(ConnectionStatusEnum.ERROR);
  }

  protected validate(): void {
    const validStatuses = Object.values(ConnectionStatusEnum);
    if (!validStatuses.includes(this._value)) {
      throw new ValidationError([
        { field: 'conectionStataus', message: 'Invalid connection status' },
      ]);
    }
  }

  protected throwErrorForInvalidValue(): void {
    throw new Error('Status not Supported.');
  }

  static fromValue(value: string): ConnectionStatus {
    const statusToValidate = value.trim();
    const foundStatus = Object.values(ConnectionStatusEnum).find(
      (statusValue) => statusToValidate === statusValue
    );

    if (!foundStatus) {
      throw new ValueObjectValidationError(
        `Status <${statusToValidate}> is not supported.`,
        'status'
      );
    }

    return new ConnectionStatus(foundStatus);
  }

  isConnected(): boolean {
    return this._value === ConnectionStatusEnum.CONNECTED;
  }

  canSendMessages(): boolean {
    return this._value === ConnectionStatusEnum.CONNECTED;
  }
}
