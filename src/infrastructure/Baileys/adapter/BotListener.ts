import { WASocket } from '@whiskeysockets/baileys';
import { BotServiceMongo } from '../../../application/bot/BotServiceMongo';
import { IMessageService } from '../../baileys/adapter/IMessageService';
import { IConversationStore } from '../../../application/bot/IConversationStore';

import { BotServiceMongo } from '../../../application/bot/BotServiceMongo';
import { FlowTriggerResolver } from '../../../application/services/bot/FlowTriggerResolver';
import { FlowEngine } from '../../../application/services/bot/FlowEngine';
import { InputNodeExecutor } from '../../../application/services/bot/InputNodeExecutor';
import { MessageNodeExecutor } from '../../../application/services/bot/MessageNodeExecutor';
import { MongoFlowRepository } from '../../../infrastructure/persistence/Mongo/Repositories/MongoFlowRepository';
import { FlowStore } from '../../../infrastructure/persistence/Mongo/Repositories/FlowStore';
import { InMemoryConversationStore } from '../../../application/bot/InMemoryConversationStore';
import { InMemoryMessageService } from './InMemoryMessageService';

export class BotListener {
  private _socket?: WASocket;
  private _initialized = false;
  private _botService?: BotServiceMongo;
  private _botListenerInitialized = false;

  constructor(private readonly botService: BotServiceMongo, private readonly instanceId: string) {}

  attachSocket(socket: WASocket): void {
    if (this._initialized) return;
    this._socket = socket;
    // Initialize bot wiring lazily when socket is available
    try {
      // Instantiate minimal in-memory/mixed components for MVP until full DI is wired
      const triggerResolver = new FlowTriggerResolver();
      const flowEngine = new FlowEngine([new InputNodeExecutor(), new MessageNodeExecutor()]);
      const flowRepo = new MongoFlowRepository();
      const flowStore = new FlowStore(flowRepo);
      const store = new InMemoryConversationStore();
      const messaging = new InMemoryMessageService();
      // Create bot service and listener wiring
      this._botService = new BotServiceMongo(triggerResolver, flowEngine, store, messaging, flowRepo, flowStore);
      const listener = new (require('./BotListener').BotListener)(this._botService, this.instanceId);
      listener.attachSocket(this._socket);
      this._botListenerInitialized = true;
    } catch {
      // ignore wiring errors in early MVP
    }
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
