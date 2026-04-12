import { WAMessage } from '@whiskeysockets/baileys';

import { WhatsAppInstanceAggregate } from '@domain/aggregates/WhatsAppInstanceAggregate';
import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { BaileysConnection } from './BaileysConnection';
import { BaileysEventRouter } from './BaileysEventRouter';
import { BaileysMessageService } from './BaileysMessageService';

export class WhatsAppInstanceRuntime {
  private _connection!: BaileysConnection;
  private _messaging!: BaileysMessageService;

  constructor(
    private readonly instance: WhatsAppInstanceAggregate,
    private readonly repository: IWhatsAppInstanceRepository
  ) {}

  async start(): Promise<void> {
    this._connection = new BaileysConnection(this.instance.instanceId, {
      onQR: async (qr) => {
        this.instance.generateQRCode(qr, qr);
        await this.repository.update(this.instance);
      },
      onConnected: async (phone) => {
        this.instance.connect(phone);
        await this.repository.update(this.instance);
      },
      onDisconnected: async (reason) => {
        this.instance.disconnect(reason);
        await this.repository.update(this.instance);
      },
    });

    await this._connection.connect();

    const socket = this._connection.getSocket();

    this._messaging = new BaileysMessageService(socket);

    const router = new BaileysEventRouter(socket, this.instance);
    router.bind();
  }

  async sendText(to: string, text: string): Promise<WAMessage | undefined> {
    if (!this.instance.canSendMessages()) {
      throw new Error('Instance not ready');
    }
    return this._messaging.sendText(to, text);
  }

  async stop(): Promise<void> {
    await this._connection.disconnect();
  }
}
