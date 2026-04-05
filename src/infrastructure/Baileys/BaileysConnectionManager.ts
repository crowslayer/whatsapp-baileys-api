import { setTimeout as delay } from 'node:timers/promises';

import { WAMessage, WAMessageKey } from '@whiskeysockets/baileys';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';
import { ConnectionStatusEnum } from '@domain/value-objects/ConnectionStatus';

import { IChatSynchronizer } from '@application/chats/synchronize/IChatSynchronizer';

import { BaileysAdapter } from '@infrastructure/baileys/BaileysAdapter';
import { BaileysRateLimiter } from '@infrastructure/baileys/BaileysRateLimiter';
import { IBaileysChat } from '@infrastructure/baileys/IBaileysChat';
import { WebhookService } from '@infrastructure/http/webhooks/WebhookService';
import { ILogger } from '@infrastructure/loggers/Logger';
import { IMessageMetrics, IMetricsInstanceStats } from '@infrastructure/metrics/IMessageMetrics';

import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

export class BaileysConnectionManager {
  private _connections: Map<string, BaileysAdapter> = new Map();

  private _connecting = new Set<string>();

  private _limiters = new Map<string, BaileysRateLimiter>();

  private readonly _webhookService: WebhookService;

  private readonly _messageLimiter = new BaileysRateLimiter({ concurrency: 1, minDelayMs: 400 });

  private readonly _queryLimiter = new BaileysRateLimiter({ concurrency: 2, minDelayMs: 300 });

  private readonly _heavyLimiter = new BaileysRateLimiter({ concurrency: 1, minDelayMs: 1000 });

  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly syncService: IChatSynchronizer,
    private readonly _logger: ILogger,
    private readonly _metrics?: IMessageMetrics
  ) {
    this._webhookService = new WebhookService(_logger);
  }

  // Limiter por instancia

  private getLimiter(instanceId: string): BaileysRateLimiter {
    if (this._limiters.has(instanceId)) {
      const limiter = this._limiters.get(instanceId);
      if (limiter) return limiter;
    }
    const limiter = new BaileysRateLimiter({
      concurrency: 1,
      minDelayMs: 400 + Math.random() * 300, // jitter base
    });
    this._limiters.set(instanceId, limiter);
    return limiter;
  }

  // human delays simulating
  private humanDelay(base: number = 400): number {
    return base + Math.floor(Math.random() * 300);
  }

  // antispam testing
  private async simulateHumanSend(
    adapter: BaileysAdapter,
    jid: string,
    text: string
  ): Promise<WAMessage | undefined> {
    const profile = this.getMessageProfile(text);

    // 1. typing
    try {
      await adapter.updatePresence(jid, 'composing');
    } catch (error) {
      this._logger.error('Update presence failed', error);
    }

    await delay(profile.typing);

    // 2. send
    const result = await adapter.sendText(jid, text);

    // 3. small pause
    await delay(profile.postDelay);

    // 4. stop typing
    await adapter.updatePresence(jid, 'paused');

    // 5. sometimes go offline
    if (profile.goOffline) {
      await delay(500 + Math.random() * 1500);
      try {
        await adapter.updatePresence(jid, 'unavailable');
      } catch (error) {
        this._logger.error('Error update presence unavailable', error);
      }
    }

    return result;
  }

  // eslint-disable-next-line
  async createConnection(
    instanceId: string,
    usePairingCode: boolean = false,
    phoneNumber?: string
  ): Promise<void> {
    if (this._connections.has(instanceId) || this._connecting.has(instanceId)) {
      this._logger.warn('Instance already connected');
      return;
    }

    this._connecting.add(instanceId);

    const instance = await this.repository.findById(instanceId);
    if (!instance) throw new NotFoundError(`Instance ${instanceId} not found`);
    try {
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
        onConnectionClosed: async (event) => {
          if (!this._connections.has(instanceId)) return;

          instance.disconnect(event.reason);
          await this.repository.update(instance);

          if (!event.recoverable) {
            this._connections.delete(instanceId);
            this._connecting.delete(instanceId);
            this._webhookService.removeWebhook(instanceId);
            this._logger.warn('Final disconnect', event);
          }
          this._logger.warn(`Recoverable disconnect (${event.reason})`);
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

      this._connections.set(instanceId, adapter);

      instance.updateStatus(ConnectionStatusEnum.CONNECTING);
      await this.repository.update(instance);

      if (usePairingCode && phoneNumber) {
        await adapter.connect(phoneNumber);
      } else {
        await adapter.connect();
      }
      this._connecting.delete(instanceId);

      this._logger.info(`Instance ${instanceId} connected with phone ${phoneNumber}`);
    } catch (error) {
      this._connections.delete(instanceId);
      this._connecting.delete(instanceId);
      this._webhookService.removeWebhook(instanceId);
      instance.disconnect('Connection failed');
      await this.repository.update(instance);
      throw error;
    } finally {
      this._connecting.delete(instanceId);
    }
  }

  async disconnectInstance(instanceId: string): Promise<void> {
    const adapter = this._connections.get(instanceId);
    if (!adapter) return;

    this._logger.info('Disconnected Instances');
    await adapter.disconnect();
    this._connections.delete(instanceId);
    this._connecting.delete(instanceId);
    this._webhookService.removeWebhook(instanceId);
  }

  async logoutInstance(instanceId: string): Promise<void> {
    const adapter = this._connections.get(instanceId);
    if (!adapter) {
      throw new WhatsAppConnectionError('Instances not found');
    }
    await adapter.logout();
  }

  getConnection(instanceId: string): BaileysAdapter | undefined {
    return this._connections.get(instanceId);
  }

  async isConnected(instanceId: string): Promise<boolean> {
    const adapter = this._connections.get(instanceId);
    return !!(await adapter?.isAlive());
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

  async sendMessage(instanceId: string, to: string, text: string): Promise<WAMessage | undefined> {
    const adapter = this.getAdapterOrThrow(instanceId);
    const limiter = this.getLimiter(instanceId);
    // metrics
    this._metrics?.recordAttempt(instanceId);
    const start = Date.now();

    try {
      const result = await this.timeout(
        limiter.run(() => this.simulateHumanSend(adapter, to, text)),
        10000
      );
      this._metrics?.recordSent(instanceId, Date.now() - start);
      return result;
    } catch (error) {
      this._metrics?.recordFailed(instanceId, error);
      throw error;
    }
  }

  async getGroups(instanceId: string): Promise<IBaileysChat[]> {
    const adapter = this.getAdapterOrThrow(instanceId);

    return await this._heavyLimiter.run(async () => {
      const groups = await adapter.syncGroupsMetadata();
      await this.syncService.syncChats(instanceId, groups, false);
      return groups;
    });
  }
  // eslint-disable-next-line
  async fetchHistory(
    instanceId: string,
    count: number,
    key: WAMessageKey,
    timestamp: number
  ): Promise<string | undefined> {
    const adapter = this.getAdapterOrThrow(instanceId);

    return this._heavyLimiter.run(() => adapter.fetchMessageHistory(count, key, timestamp));
  }

  // eslint-disable-next-line
  async getProfilePicture(instanceId: string, jid: string): Promise<string | undefined> {
    const adapter = this.getAdapterOrThrow(instanceId);

    return this._queryLimiter.run(() => adapter.getProfilePictureUrl(jid));
  }

  async sendBulkMessage(instanceId: string, toList: string[], text: string): Promise<void> {
    // proteccion contra backpresure
    if (toList.length > 1000) throw new Error('Bulk limit exceed');

    let success = 0;
    let failed = 0;

    for (const to of toList) {
      try {
        await this.timeout(
          this._messageLimiter.run(() => this.sendMessage(instanceId, to, text)),
          10000
        );
        success++;
      } catch (error) {
        failed++;
      }
      // delay
      await delay(this.humanDelay(600));
      if (success % 20 === 0) {
        await delay(5000); // pausa cada 20 mensajes
      }
    }

    const metric = {
      instanceId,
      success,
      failed,
    };

    this._logger.info(`Bulk result: ${success} sent, ${failed} failed`);
    this._logger.info('Bulk Messageg sent', metric);
  }

  // return metrics
  getMetrics(instanceId: string): IMetricsInstanceStats | undefined {
    return (
      this._metrics?.getStats(instanceId) ?? {
        attempts: 0,
        sent: 0,
        failed: 0,
        totalLatency: 0,
        avgLatency: 0,
      }
    );
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

  private getAdapterOrThrow(instanceId: string): BaileysAdapter {
    const adapter = this._connections.get(instanceId);
    if (!adapter) {
      throw new WhatsAppConnectionError('Instance not connected');
    }
    return adapter;
  }
  private getMessageProfile(text: string) {
    const length = text.length;

    if (length < 10) {
      return {
        typing: 200 + Math.random() * 200,
        postDelay: 200 + Math.random() * 300,
        goOffline: false,
      };
    }

    if (length < 20) {
      return {
        typing: 300 + Math.random() * 400,
        postDelay: 300 + Math.random() * 400,
        goOffline: false,
      };
    }

    if (length < 120) {
      return {
        typing: 1000 + Math.random() * 1500,
        postDelay: 500 + Math.random() * 800,
        goOffline: Math.random() > 0.8,
      };
    }

    return {
      typing: 2000 + Math.random() * 4000,
      postDelay: 1000 + Math.random() * 1500,
      goOffline: true,
    };
  }

  private timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      delay(ms).then(() => {
        throw new Error('timeout');
      }),
    ]);
  }
}
