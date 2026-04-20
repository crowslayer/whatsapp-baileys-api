import { FlowEngine } from '@application/services/bot/FlowEngine';
import { FlowRegistry } from '@application/services/bot/FlowRegistry';
import { IConversationStore } from '@application/services/bot/IConversationStore';

import { IMessageService } from '@infrastructure/baileys/adapter/IMessageService';

export class BotService {
  constructor(
    private readonly flowRegistry: FlowRegistry,
    private readonly flowEngine: FlowEngine,
    private readonly store: IConversationStore,
    private readonly messaging: IMessageService
  ) {}

  async handleMessage(instanceId: string, chatId: string, text: string): Promise<void> {
    let state = await this.store.get(instanceId, chatId);

    // 👉 iniciar flujo si no existe
    if (!state?.currentFlowId) {
      const flow = this.flowRegistry.get('welcome'); // ejemplo

      state = {
        instanceId,
        chatId,
        currentFlowId: flow.id,
        currentNodeId: flow.start,
        variables: {},
      };
    }

    const flow = this.flowRegistry.get(state.currentFlowId);

    const result = this.flowEngine.execute(flow, state, text);

    // actualizar estado
    state.currentNodeId = result.nextNodeId;
    state.variables = result.updatedVariables ?? state.variables;

    await this.store.set(instanceId, chatId, state);

    // responder si hay mensaje
    if (result.reply) {
      await this.messaging.sendText(chatId, result.reply);
    }
  }
}
