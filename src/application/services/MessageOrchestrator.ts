import { setTimeout as delay } from 'node:timers/promises';

import { OutgoingWhatsAppMessage } from '@domain/events/OutgoingWhatsAppMessage';
import { ISentMessage } from '@domain/messages/MessageTypes';

import { RuntimeError } from '@application/runtime/errors/RuntimeError';
import { IRuntimeManager } from '@application/runtime/IRuntimeManager';
import { HumanBehaviorService } from '@application/services/HumanBehaviorService';
import { LimiterFactory } from '@application/services/LimiterFactory';

import { IEventBus } from '@shared/domain/IEventBus';

export class MessageOrchestrator {
  constructor(
    private readonly runtimeRegistry: IRuntimeManager,
    private readonly limiterFactory: LimiterFactory,
    private readonly human: HumanBehaviorService,
    private readonly eventBus: IEventBus
  ) {}

  // ===============================
  // SINGLE MESSAGE
  // ===============================
  async send(instanceId: string, to: string, text: string): Promise<ISentMessage | undefined> {
    const runtime = this.runtimeRegistry.get(instanceId);
    const limiter = this.limiterFactory.getLimiter(instanceId);

    return this.withRetry(async () => {
      return limiter.run(async () => {
        await this.human.simulateTyping(runtime, to, text);

        const result = await this.withTimeout(runtime.messaging.sendText(to, text), 10000);
        if (!result) {
          throw new RuntimeError('Message was not sent');
        }

        this.eventBus.publish([
          OutgoingWhatsAppMessage.create(result.messageId, {
            instanceId,
            chatId: result.chatId,
            messageId: result.messageId,
            senderId: result.senderId,
            timestamp: result.timestamp,
            content: result.content,
          }),
        ]);

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
      throw new RuntimeError('Bulk limit exceeded');
    }

    let success = 0;
    let failed = 0;
    let processed = 0;

    for (const to of toList) {
      try {
        await this.send(instanceId, to, text);
        success++;
      } catch {
        failed++;
      }

      processed++;

      // delay humano entre mensajes
      await delay(500 + Math.random() * 500);

      // pausa cada 20 mensajes
      if (processed % 20 === 0) {
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
        throw new RuntimeError('timeout');
      }),
    ]);
  }
}
