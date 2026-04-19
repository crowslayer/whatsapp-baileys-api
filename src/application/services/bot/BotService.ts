import { BotInput } from '@application/services/bot/IBotService';
import { IConversationStore } from '@application/services/bot/IConversationStore';

import { IMessageService } from '@infrastructure/baileys/adapter/IMessageService';

type ConversationState = {
  step?: 'ask_name' | 'done';
  name?: string;
};

export class BotService {
  constructor(
    private readonly messaging: IMessageService,
    private readonly store: IConversationStore<ConversationState>
  ) {}

  async handleMessage(input: BotInput): Promise<void> {
    const ctx = await this.store.get(input.instanceId, input.from);

    if (!ctx?.step) {
      await this.messaging.sendText(input.from, '¿Cómo te llamas?');

      await this.store.set(input.instanceId, input.from, {
        step: 'ask_name',
      });

      return;
    }

    if (ctx.step === 'ask_name') {
      await this.messaging.sendText(input.from, `Mucho gusto ${input.message} 👋`);

      await this.store.clear(input.instanceId, input.from);
    }
  }
}
