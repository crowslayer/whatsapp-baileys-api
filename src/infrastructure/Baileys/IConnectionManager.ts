import { WAMessage, WAMessageKey } from '@whiskeysockets/baileys/lib/Types';

import { BaileysAdapter } from '@infrastructure/baileys/BaileysAdapter';
import { IBaileysChat } from '@infrastructure/baileys/IBaileysChat';

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
  sendMessage(instanceId: string, to: string, text: string): Promise<WAMessage | undefined>;
  getGroups(instanceId: string): Promise<IBaileysChat[]>;
  fetchHistory(
    instanceId: string,
    count: number,
    key: WAMessageKey,
    timestamp: number
  ): Promise<string | undefined>;
  getProfilePicture(instanceId: string, jid: string): Promise<string | undefined>;
  sendBulkMessage(instanceId: string, toList: string[], text: string): Promise<void>;
}
