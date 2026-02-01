import { ValueObject } from "@shared/domain/ValueObject";

export enum ConnectionStatusEnum {
    DISCONNECTED = 'disconnected',
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    QR_READY = 'qr_ready',
    PAIRING_CODE_READY = 'pairing_code_ready',
    ERROR = 'error',
  }
  
  export class ConnectionStatus extends ValueObject<ConnectionStatusEnum> {
    private constructor(value: ConnectionStatusEnum) {
      super(value);
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
        throw new Error(`Invalid connection status: ${this._value}`);
      }
    }
  
    isConnected(): boolean {
      return this._value === ConnectionStatusEnum.CONNECTED;
    }
  
    canSendMessages(): boolean {
      return this._value === ConnectionStatusEnum.CONNECTED;
    }
  }