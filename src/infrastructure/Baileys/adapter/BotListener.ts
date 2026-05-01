import { WASocket } from '@whiskeysockets/baileys';
import { BotServiceMongo } from '../../../application/bot/BotServiceMongo';

export class BotListener {
  private _socket?: WASocket;
  private _initialized = false;
  private _botService?: BotServiceMongo;
  private _botInstance?: string;

  constructor(private readonly botService: BotServiceMongo, private readonly instanceId: string) {}

  attachSocket(socket: WASocket): void {
    if (this._initialized) return;
    this._socket = socket;
    // Wire bot service externally; initialize listener after bot service is provided
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
              // Invoke bot service; the BotListener expects botService to be wired earlier
              await this.botService.handleMessage(this.instanceId, chatId, text);
            } catch {
              // swallow errors to avoid crashing the listener
            }
          }
        }
      }
    });
  }
}
