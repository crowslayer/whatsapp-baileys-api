import { IFlow } from '@application/services/bot/FlowTypes';
import { FlowEngine } from '@application/services/bot/FlowEngine';
import { FlowTriggerResolver } from '@application/services/bot/FlowTriggerResolver';
import { IConversationStore } from '@application/services/bot/IConversationStore';
import { IMessageService } from '@infrastructure/baileys/adapter/IMessageService';
import { FlowStore } from '@infrastructure/persistence/Mongo/Repositories/FlowStore';
import { IFlowRepository } from '@domain/repositories/IFlowRepository';
import { IConversationState } from '@application/services/bot/IConversationState';

export class BotServiceMongo {
  constructor(
    private readonly triggerResolver: FlowTriggerResolver,
    private readonly flowEngine: FlowEngine,
    private readonly store: IConversationStore<IConversationState>,
    private readonly messaging: IMessageService,
    private readonly flowRepository: IFlowRepository,
    private readonly flowStore: FlowStore
  ) {}

  async handleMessage(instanceId: string, chatId: string, text: string): Promise<void> {
    const state = await this.store.get(instanceId, chatId);

    let flow: IFlow | null = null;

    if (!state?.currentFlowId) {
      const flows = await this.flowStore.loadActiveFlowsForInstance(instanceId);
      flow = this.triggerResolver.resolve(flows, text);
      if (!flow) return;
      state!.currentFlowId = flow.id;
      state!.currentNodeId = flow.start;
      // persist initial state
    } else {
      flow = await this.flowRepository.findById(state.currentFlowId);
    }
    if (!flow) return;
    const result = this.flowEngine.execute(flow, state, text);

    // actualizar estado
    state!.variables = result.variables ?? state!.variables;
    await this.store.set(instanceId, chatId, state!);

    // responder si hay mensaje
    if ((result as any).reply) {
      await this.messaging.sendText(chatId, (result as any).reply);
    }
  }
}
