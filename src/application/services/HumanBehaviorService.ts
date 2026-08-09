import { setTimeout as delay } from 'node:timers/promises';

import { IWhatsAppRuntime } from '@application/runtime/IWhatsAppRuntime';

import { ILogger } from '@infrastructure/loggers/Logger';

export class HumanBehaviorService {
  constructor(private readonly logger: ILogger) {}

  getTypingDelay(text: string): number {
    const length = text.length;

    if (length < 10) return 200 + Math.random() * 200;
    if (length < 50) return 500 + Math.random() * 500;
    if (length < 120) return 1000 + Math.random() * 1500;

    return 2000 + Math.random() * 3000;
  }

  getPostDelay(): number {
    return 300 + Math.random() * 500;
  }

  shouldGoOffline(): boolean {
    return Math.random() > 0.8;
  }

  async simulateTyping(runtime: IWhatsAppRuntime, to: string, text: string): Promise<void> {
    const safeJid = this.sanitizeJid(to);

    try {
      if (safeJid && safeJid.endsWith('s.whatsapp.net')) {
        await runtime.presence.sendPresence(to, 'composing');
      }
    } catch (error) {
      this.logger.error('Error actualiando presencia a composing', error);
    }

    await delay(this.getTypingDelay(text));

    try {
      if (safeJid) {
        await runtime.presence.sendPresence(safeJid, 'paused');
      }
    } catch (error) {
      this.logger.error('Error actualiando estado', error);
    }
  }

  async simulateAfterSend(runtime: IWhatsAppRuntime, to: string): Promise<void> {
    const safeJid = this.sanitizeJid(to);

    await delay(this.getPostDelay());

    if (this.shouldGoOffline()) {
      await delay(500 + Math.random() * 1500);
      try {
        if (safeJid) {
          await runtime.presence.sendPresence(safeJid, 'unavailable');
        }
      } catch (error) {
        this.logger.error('Error actualiando a unavailable', error);
      }
    }
  }

  private sanitizeJid(jid: string): string | null {
    if (!jid) return null;
    if (!jid.includes('@')) return null; // no contiene dominio válido
    if (!jid.endsWith('s.whatsapp.net') && !jid.endsWith('g.us')) return null;
    return jid;
  }
}
