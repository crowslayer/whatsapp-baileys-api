import { BaileysAdapter } from '@infrastructure/baileys/BaileysAdapter';

export interface IConnectionManager {
  createConnection(
    instanceId: string,
    usePairingCode: boolean,
    phoneNumber?: string
  ): Promise<void>;
  disconnectInstance(instanceId: string): Promise<void>;
  logoutInstance(instanceId: string): Promise<void>;
  getConnection(instanceId: string): BaileysAdapter | undefined;
  isConnected(instanceId: string): boolean;
  restoreConnections(): Promise<void>;
  getAllConnections(): Map<string, BaileysAdapter>;
  sendWebhook(instanceId: string, type: string, body: unknown): Promise<void>;
}
