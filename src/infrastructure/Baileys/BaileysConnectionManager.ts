import axios, { AxiosInstance } from 'axios';

import { IChatRepository } from '@domain/repositories/IChatRepository';
import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';
import { ConnectionStatusEnum } from '@domain/value-objects/ConnectionStatus';

import { ChatSynchronizer } from '@application/chats/syncronize/ChatSynchronizer';
import { SyncChatsCommand } from '@application/chats/syncronize/SyncChatsCommand';
import { ChatsUpdater } from '@application/chats/update/ChatsUpdater';
import { UpdateChatsCommand } from '@application/chats/update/UpdateChatsCommand';

import { ILogger } from '@infrastructure/loggers/Logger';

import { DatabaseConnectionError } from '@shared/infrastructure/errors/DatabaseConnectionError';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

import { BaileysAdapter } from './BaileysAdapter';

export class BaileysConnectionManager {
  private _connections: Map<string, BaileysAdapter> = new Map();
  /** Cliente HTTP por instancia para enviar webhooks a la URL configurada de cada una */
  private _webhookClients: Map<string, AxiosInstance> = new Map();

  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly _logger: ILogger,
    private readonly chatRepository: IChatRepository,
    private readonly chatSynchronizer: ChatSynchronizer,
    private readonly chatUpdater: ChatsUpdater
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
          await this.chatSynchronizer.execute(new SyncChatsCommand(instanceId, chats, isFirstSync));
        },
        onChatsUpdate: async (updates) => {
          await this.chatUpdater.execute(new UpdateChatsCommand(instanceId, updates));
        },
        onChatsDelete: async (chatIds) => {
          for (const id of chatIds) await this.chatRepository.delete(id, instanceId);
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
    if (adapter) {
      adapter.disconnect();
      this._connections.delete(instanceId);
      this._webhookClients.delete(instanceId);

      const instance = await this.repository.findById(instanceId);
      if (instance) {
        instance.disconnect('Manual disconnect');
        await this.repository.update(instance);
      }
    }
  }

  async logoutInstance(instanceId: string): Promise<void> {
    const adapter = this._connections.get(instanceId);
    if (adapter) {
      await adapter.logout();
      this._connections.delete(instanceId);
      this._webhookClients.delete(instanceId);

      const instance = await this.repository.findById(instanceId);
      if (instance) {
        instance.disconnect('Logged out');
        await this.repository.update(instance);
      }
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
