import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';
import { ConnectionStatusEnum } from '@domain/value-objects/ConnectionStatus';

import { IChatSynchronizer } from '@application/chats/synchronize/IChatSynchronizer';

import { BaileysAdapter } from '@infrastructure/baileys/BaileysAdapter';
import { WebhookService } from '@infrastructure/http/webhooks/WebhookService';
import { ILogger } from '@infrastructure/loggers/Logger';

import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

export class BaileysConnectionManager {
  private _connections: Map<string, BaileysAdapter> = new Map();
  private readonly _webhookService: WebhookService;

  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly syncService: IChatSynchronizer,
    private readonly _logger: ILogger
  ) {
    this._webhookService = new WebhookService(_logger);
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
        this._webhookService.configureWebhook(instance.webhookUrl, instanceId);
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
          await this.syncService.deleteChats(instanceId, chatIds);
        },
        onContactsUpsert: async (contacts) => {
          await this.sendWebhook(instanceId, 'contacts.upsert', { contacts });
        },
        onContactsUpdate: async (contacts) => {
          await this.sendWebhook(instanceId, 'contacts.update', { contacts });
        },
        onPresenceUpdate: async (presence) => {
          await this.sendWebhook(instanceId, 'presence.update', { presence });
        },
        onGroupsUpsert: async (groups) => {
          const chats = groups.map((g) => {
            const jid = String(g.id);
            return {
              chatId: jid,
              name: g.subject || jid,
              type: 'group' as const,
              unreadCount: 0,
              isArchived: false,
              isMuted: false,
              participantCount: g.participants?.length,
              description: g.desc,
            };
          });
          await this.syncService.syncChats(instanceId, chats, true);
        },
        onGroupsUpdate: async (groups) => {
          const partial = groups.map((g) => {
            return {
              chatId: String(g.id),
              name: g.subject ? g.subject : undefined,
              description: g.desc ? g.desc : undefined,
            };
          });
          await this.syncService.updateChats(instanceId, partial);
        },
        onGroupParticipantsUpdate: async (update) => {
          await this.sendWebhook(instanceId, 'group.participants', { update });
        },
        onLabelsAssociation: async (association) => {
          await this.sendWebhook(instanceId, 'labels.association', { association });
        },
        onLabelsEdit: async (label) => {
          await this.sendWebhook(instanceId, 'labels.edit', { label });
        },
      });

      if (usePairingCode && phoneNumber) {
        await adapter.connect(phoneNumber);
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
    await adapter.disconnect();
    this._connections.delete(instanceId);
    this._webhookService.removeWebhook(instanceId);

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
    this._webhookService.removeWebhook(instanceId);

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
    this._logger.info('Restoring WhatsApp connections...');

    const instances = await this.repository.findAll();
    const toRestore = instances.filter((i) => i.status.isConnected());

    if (toRestore.length === 0) {
      this._logger.info('No instances to restore');
      return;
    }

    const results = await Promise.allSettled(
      toRestore.map((i) => this.createConnection(i.instanceId))
    );

    results.forEach((result, index) => {
      const instance = toRestore[index];
      if (result.status === 'fulfilled') {
        this._logger.info(`Restored connection for instance ${instance?.instanceId}`);
      } else {
        this._logger.error(
          `Failed to restore connection for instance ${instance?.instanceId}:`,
          result.reason
        );
        // No relanza — el resto de instancias siguen restaurándose
      }
    });

    const failed = results.filter((r) => r.status === 'rejected').length;
    this._logger.info(
      `Restore complete: ${results.length - failed}/${results.length} instances restored`
    );
  }

  getAllConnections(): Map<string, BaileysAdapter> {
    return this._connections;
  }

  /**
   * Envía un webhook a la URL configurada para la instancia.
   * Usa circuit breaker para evitar fallos en cascada.
   * Los errores se registran pero no se relanzan.
   */
  async sendWebhook(instanceId: string, type: string, body: unknown): Promise<void> {
    const sent = await this._webhookService.send(instanceId, type, body);
    if (!sent) {
      this._logger.warn(
        `Webhook skipped for instance ${instanceId} (${type}) - circuit open or no client`
      );
    }
  }
}
