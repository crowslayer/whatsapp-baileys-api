import { setTimeout as delay } from 'node:timers/promises';

import { IWhatsAppRuntime } from '@infrastructure/baileys/adapter/IWhatsAppRuntime';

export class HumanBehaviorService {
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
    try {
      await runtime.presence.sendPresence(to, 'composing');
    } catch {
      console.error('Error actualiando presencia a composing');
    }

    await delay(this.getTypingDelay(text));

    try {
      await runtime.presence.sendPresence(to, 'paused');
    } catch {
      console.error('Error actualiando estado');
    }
  }

  async simulateAfterSend(runtime: IWhatsAppRuntime, to: string): Promise<void> {
    await delay(this.getPostDelay());

    if (this.shouldGoOffline()) {
      await delay(500 + Math.random() * 1500);
      try {
        await runtime.presence.sendPresence(to, 'unavailable');
      } catch {
        console.error('Error actualiando a unavailable');
      }
    }
  }
}
