import axios, { AxiosInstance } from 'axios';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';
import { ConnectionStatusEnum } from '@domain/value-objects/ConnectionStatus';

import { IChatSynchronizer } from '@application/chats/synchronize/IChatSynchronizer';

import { ILogger } from '@infrastructure/loggers/Logger';

import { DatabaseConnectionError } from '@shared/infrastructure/errors/DatabaseConnectionError';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

import { BaileysAdapter } from './BaileysAdapter';

export class BaileysConnectionManager {
  private _connections: Map<string, BaileysAdapter> = new Map();
  /** Cliente HTTP por instancia para enviar webhooks a la URL configurada de cada una */
  private _webhookClients: Map<string, AxiosInstance> = new Map();

  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly syncService: IChatSynchronizer,
    private readonly _logger: ILogger
  ) {}

  private setWebhookUrl(webhookUrl: string, instanceId: string): void {
    const baseURL = webhookUrl.replace(/\/$/, '');
    this._webhookClients.set(
      instanceId,
      axios.create({
        baseURL,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    this._logger.info(`Webhook configured for instance ${instanceId}: ${baseURL}`);
  }

  async createConnection(
    instanceId: string,
    usePairingCode: boolean = false,
    phoneNumber?: string
  ): Promise<void> {
    try {
      const instance = await this.repository.findById(instanceId);
      if (!instance) {
        throw new NotFoundError(`Instance ${instanceId} not found`);
      }

      if (instance.webhookUrl) {
        this.setWebhookUrl(instance.webhookUrl, instanceId);
      }

      const adapter = new BaileysAdapter({
        instanceId,
        onQRCode: async (qrBase64, qrText) => {
          instance.generateQRCode(qrBase64, qrText);
          await this.repository.update(instance);
          this._logger.info(`QR Code generated for instance ${instanceId}`);
        },
        onPairingCode: async (code) => {
          instance.generatePairingCode(code);
          await this.repository.update(instance);
          this._logger.info(`Pairing code generated for instance ${instanceId}: ${code}`);
        },
        onConnected: async (phoneNumber) => {
          instance.connect(phoneNumber);
          await this.repository.update(instance);
          this._logger.info(`Instance ${instanceId} connected with phone ${phoneNumber}`);
        },
        onDisconnected: async (reason) => {
          instance.disconnect(reason);
          await this.repository.update(instance);
          this._connections.delete(instanceId);
          this._logger.info(`Instance ${instanceId} disconnected: ${reason}`);
        },
        onMessage: async (message) => {
          await this.sendWebhook(instanceId, 'message', { message });
        },
        onChatsUpsert: async (chats, isFirstSync) => {
          // primer lote = history sync → fullRefresh: true
          // lotes siguientes = tiempo real → fullRefresh: false
          await this.syncService.syncChats(instanceId, chats, isFirstSync);
        },
        onChatsUpdate: async (updates) => {
          await this.syncService.updateChats(instanceId, updates);
        },
        onChatsDelete: async (chatIds) => {
          this.syncService.deleteChats(instanceId, chatIds);
        },
      });

      if (usePairingCode && phoneNumber) {
        await adapter.connectWithPairingCode(phoneNumber);
      } else {
        await adapter.connect();
      }

      this._connections.set(instanceId, adapter);
      instance.updateStatus(ConnectionStatusEnum.CONNECTING);
      await this.repository.update(instance);
    } catch (error) {
      this._logger.error(`Failed to create connection for instance ${instanceId}:`, error);
      throw error;
    }
  }

  async disconnectInstance(instanceId: string): Promise<void> {
    const adapter = this._connections.get(instanceId);
    if (!adapter) {
      throw new WhatsAppConnectionError('Instances not found');
    }
    this._logger.info('Disconnected Instances');
    adapter.disconnect();
    this._connections.delete(instanceId);
    this._webhookClients.delete(instanceId);

    const instance = await this.repository.findById(instanceId);
    if (instance) {
      this._logger.info('Erase Instance...');
      instance.disconnect('Manual disconnect');
      await this.repository.update(instance);
    }
  }

  async logoutInstance(instanceId: string): Promise<void> {
    const adapter = this._connections.get(instanceId);
    if (!adapter) {
      throw new WhatsAppConnectionError('Instances not found');
    }
    await adapter.logout();
    this._connections.delete(instanceId);
    this._webhookClients.delete(instanceId);

    const instance = await this.repository.findById(instanceId);
    if (instance) {
      instance.disconnect('Logged out');
      await this.repository.update(instance);
    }
  }

  getConnection(instanceId: string): BaileysAdapter | undefined {
    return this._connections.get(instanceId);
  }

  isConnected(instanceId: string): boolean {
    return this._connections.has(instanceId);
  }

  async restoreConnections(): Promise<void> {
    this._logger.info('Restoring WhatsApp _connections...');
    const instances = await this.repository.findAll();

    for (const instance of instances) {
      if (instance.status.isConnected()) {
        try {
          await this.createConnection(instance.instanceId);
          this._logger.info(`Restored connection for instance ${instance.instanceId}`);
        } catch (error) {
          this._logger.error(
            `Failed to restore connection for instance ${instance.instanceId}:`,
            error
          );
          throw new DatabaseConnectionError(error);
        }
      }
    }
  }

  getAllConnections(): Map<string, BaileysAdapter> {
    return this._connections;
  }

  /**
   * Envía un webhook a la URL configurada para la instancia.
   * Solo se envía si la instancia tiene webhookUrl; los errores se registran pero no se relanzan.
   */
  async sendWebhook(instanceId: string, type: string, body: unknown): Promise<void> {
    const client = this._webhookClients.get(instanceId);
    if (!client) return;

    try {
      await client.post('', {
        type,
        body,
        instanceId,
        timestamp: new Date().toISOString(),
      });
    } catch (error: unknown) {
      this._logger.error(`Webhook error for instance ${instanceId} (${type}):`, error);
      // No relanzar: el webhook no debe romper el flujo de mensajes
    }
  }
}
