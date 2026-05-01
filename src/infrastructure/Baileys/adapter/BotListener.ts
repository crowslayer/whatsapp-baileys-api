import { WASocket } from '@whiskeysockets/baileys';
import { BotServiceMongo } from '../../../application/bot/BotServiceMongo';
import { IMessageService } from '../../baileys/adapter/IMessageService';
import { IConversationStore } from '../../../application/bot/IConversationStore';

export class BotListener {
  private _socket?: WASocket;
  private _initialized = false;

  constructor(private readonly botService: BotServiceMongo, private readonly instanceId: string) {}

  attachSocket(socket: WASocket): void {
    if (this._initialized) return;
    this._socket = socket;
    this.setupListeners();
    this._initialized = true;
  }

  private setupListeners(): void {
    const s = this._socket;
    if (!s) return;
    s.ev.process(async (events) => {
      if (events['messages.upsert']) {
        const { messages, type } = events['messages.upsert'];
        if (type !== 'notify') return;

        for (const msg of messages) {
          if (msg.key?.fromMe) continue;
          const chatId = String(msg.key?.remoteJid ?? '');
          const text = msg.message?.conversation ?? msg.message?.extendedTextMessage?.text ?? '';
          if (chatId && text) {
            try {
              await this.botService.handleMessage(this.instanceId, chatId, text);
            } catch (e) {
              // robust: swallow to not crash the listener
            }
          }
        }
      }
    });
  }
}
