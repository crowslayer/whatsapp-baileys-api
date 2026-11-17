export type ConnectionState = {
  qr?: {
    base64: string;
    text: string;
  };
  pairingCode?: string;
  status?: 'idle' | 'qr' | 'connected';
};

export interface IConnectionStateStore {
  get(instanceId: string): Promise<ConnectionState | null>;

  setQR(instanceId: string, qrBase64: string, qrText: string): Promise<void>;

  setPairingCode(instanceId: string, code: string): Promise<void>;

  setStatus(instanceId: string, status: ConnectionState['status']): Promise<void>;

  clear(instanceId: string): Promise<void>;
}
