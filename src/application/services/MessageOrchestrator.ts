import { setTimeout as delay } from 'node:timers/promises';

import { WAMessage } from '@whiskeysockets/baileys';

import { RuntimeRegistry } from '@application/runtime/RuntimeRegistry';
import { HumanBehaviorService } from '@application/services/HumanBehaviorService';
import { LimiterFactory } from '@application/services/LimiterFactory';

export class MessageOrchestrator {
  constructor(
    private readonly runtimeRegistry: RuntimeRegistry,
    private readonly limiterFactory: LimiterFactory,
    private readonly human: HumanBehaviorService
  ) {}

  // ===============================
  // SINGLE MESSAGE
  // ===============================
  async send(instanceId: string, to: string, text: string): Promise<WAMessage | undefined> {
    const runtime = this.runtimeRegistry.get(instanceId);
    const limiter = this.limiterFactory.getLimiter(instanceId);

    return this.withRetry(async () => {
      return limiter.run(async () => {
        await this.human.simulateTyping(runtime, to, text);

        const result = await this.withTimeout(runtime.messaging.sendText(to, text), 10000);

        await this.human.simulateAfterSend(runtime, to);

        return result;
      });
    });
  }

  // ===============================
  // BULK (ANTI-BAN SAFE)
  // ===============================
  async sendBulk(
    instanceId: string,
    toList: string[],
    text: string
  ): Promise<{ success: number; failed: number }> {
    if (toList.length > 1000) {
      throw new Error('Bulk limit exceeded');
    }

    let success = 0;
    let failed = 0;

    for (const to of toList) {
      try {
        await this.send(instanceId, to, text);
        success++;
      } catch {
        failed++;
      }

      // delay humano entre mensajes
      await delay(500 + Math.random() * 500);

      // pausa cada 20 mensajes
      if (success % 20 === 0) {
        await delay(5000);
      }
    }

    return { success, failed };
  }

  // ===============================
  // RETRY STRATEGY
  // ===============================
  private async withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) throw error;
      await delay(500);
      return this.withRetry(fn, retries - 1);
    }
  }

  // ===============================
  // TIMEOUT
  // ===============================
  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      delay(ms).then(() => {
        throw new Error('timeout');
      }),
    ]);
  }
}
