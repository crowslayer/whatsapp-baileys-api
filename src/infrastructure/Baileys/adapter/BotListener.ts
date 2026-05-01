import { WASocket } from '@whiskeysockets/baileys';
import { BotServiceMongo } from '../../../application/bot/BotServiceMongo';

export class BotListener {
  private _socket?: WASocket;
  private _initialized = false;
  private _botService?: BotServiceMongo;
  private _botInstance?: string;
  constructor(private readonly botService: BotServiceMongo, private readonly instanceId: string) {
    this._botService = botService;
  }
  // Allow setting bot service after construction to support dynamic wiring
  setBotService(service: BotServiceMongo) {
    this._botService = service;
  }

  attachSocket(socket: WASocket): void {
    if (this._initialized) return;
    this._socket = socket;
    // Initialize listeners; the BotService is expected to be injected via setBotService
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
              // Use the potentially injected bot service
              await (this._botService ?? this.botService).handleMessage(this.instanceId, chatId, text);
            } catch {
              // swallow errors to avoid crashing the listener
            }
          }
        }
      }
    });
  }
}
