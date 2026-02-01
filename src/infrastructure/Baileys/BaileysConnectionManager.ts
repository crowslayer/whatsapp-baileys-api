import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { ConnectionStatusEnum } from "@domain/Value-Objects/ConnectionStatus";
import { BaileysAdapter } from "./BaileysAdapter";
import { Logger } from "@infrastructure/Logger/Logger";
import axios, { AxiosInstance } from "axios";

export class BaileysConnectionManager {
  private connections: Map<string, BaileysAdapter> = new Map();
  /** Cliente HTTP por instancia para enviar webhooks a la URL configurada de cada una */
  private webhookClients: Map<string, AxiosInstance> = new Map();
  private logger: Logger;

  constructor(private repository: IWhatsAppInstanceRepository, logger: Logger) {
    this.logger = logger;
  }

  async createConnection(instanceId: string, usePairingCode: boolean = false, phoneNumber?: string): Promise<void> {
    try {
      const instance = await this.repository.findById(instanceId);
      if (!instance) {
        throw new Error(`Instance ${instanceId} not found`);
      }

      if (instance.webhookUrl) {
        const baseURL = instance.webhookUrl.replace(/\/$/, '');
        this.webhookClients.set(instanceId, axios.create({
          baseURL,
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
        }));
        this.logger.info(`Webhook configured for instance ${instanceId}: ${baseURL}`);
      }

      const adapter = new BaileysAdapter({
        instanceId,
        onQRCode: async (qrBase64, qrText) => {
          instance.generateQRCode(qrBase64, qrText);
          await this.repository.update(instance);
          this.logger.info(`QR Code generated for instance ${instanceId}`);
        },
        onPairingCode: async (code) => {
          instance.generatePairingCode(code);
          await this.repository.update(instance);
          this.logger.info(`Pairing code generated for instance ${instanceId}: ${code}`);
        },
        onConnected: async (phoneNumber) => {
          instance.connect(phoneNumber);
          await this.repository.update(instance);
          this.logger.info(`Instance ${instanceId} connected with phone ${phoneNumber}`);
        },
        onDisconnected: async (reason) => {
          instance.disconnect(reason);
          await this.repository.update(instance);
          this.connections.delete(instanceId);
          this.logger.info(`Instance ${instanceId} disconnected: ${reason}`);
        },
        onMessage: async (message) => {
          await this.sendWebhook(instanceId, 'message', { message });
        },
      });

      if (usePairingCode && phoneNumber) {
        await adapter.connectWithPairingCode(phoneNumber);
      } else {
        await adapter.connect();
      }

      this.connections.set(instanceId, adapter);
      instance.updateStatus(ConnectionStatusEnum.CONNECTING);
      await this.repository.update(instance);
    } catch (error: any) {
      this.logger.error(`Failed to create connection for instance ${instanceId}:`, error);
      throw error;
    }
  }

  async disconnectInstance(instanceId: string): Promise<void> {
    const adapter = this.connections.get(instanceId);
    if (adapter) {
      adapter.disconnect();
      this.connections.delete(instanceId);
      this.webhookClients.delete(instanceId);

      const instance = await this.repository.findById(instanceId);
      if (instance) {
        instance.disconnect('Manual disconnect');
        await this.repository.update(instance);
      }
    }
  }

  async logoutInstance(instanceId: string): Promise<void> {
    const adapter = this.connections.get(instanceId);
    if (adapter) {
      await adapter.logout();
      this.connections.delete(instanceId);
      this.webhookClients.delete(instanceId);

      const instance = await this.repository.findById(instanceId);
      if (instance) {
        instance.disconnect('Logged out');
        await this.repository.update(instance);
      }
    }
  }

  getConnection(instanceId: string): BaileysAdapter | undefined {
    return this.connections.get(instanceId);
  }

  isConnected(instanceId: string): boolean {
    return this.connections.has(instanceId);
  }

  async restoreConnections(): Promise<void> {
    this.logger.info('Restoring WhatsApp connections...');
    const instances = await this.repository.findAll();

    for (const instance of instances) {
      if (instance.status.isConnected()) {
        try {
          await this.createConnection(instance.instanceId);
          this.logger.info(`Restored connection for instance ${instance.instanceId}`);
        } catch (error) {
          this.logger.error(`Failed to restore connection for instance ${instance.instanceId}:`, error);
        }
      }
    }
  }

  getAllConnections(): Map<string, BaileysAdapter> {
    return this.connections;
  }

  /**
   * Envía un webhook a la URL configurada para la instancia.
   * Solo se envía si la instancia tiene webhookUrl; los errores se registran pero no se relanzan.
   */
  async sendWebhook(instanceId: string, type: string, body: unknown): Promise<void> {
    const client = this.webhookClients.get(instanceId);
    if (!client) return;

    try {
      await client.post('', {
        type,
        body,
        instanceId,
        timestamp: new Date().toISOString(),
      });
    } catch (error: unknown) {
      this.logger.error(`Webhook error for instance ${instanceId} (${type}):`, error);
      // No relanzar: el webhook no debe romper el flujo de mensajes
    }
  }
}