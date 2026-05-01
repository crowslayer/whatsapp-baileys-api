import { IFlow } from '@application/services/bot/FlowTypes';
import { FlowEngine } from '@application/services/bot/FlowEngine';
import { FlowTriggerResolver } from '@application/services/bot/FlowTriggerResolver';
import { IConversationStore } from '@application/services/bot/IConversationStore';
import { IFlowSessionStore } from './IFlowSessionStore';
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
    private readonly flowStore: FlowStore,
    private readonly flowSessionStore?: IFlowSessionStore
  ) {}

  async handleMessage(instanceId: string, chatId: string, text: string): Promise<void> {
    // Retrieve current state from conversation store
    let state = await this.store.get(instanceId, chatId);
    // If a flow session store is present, load flow execution state and merge
    if (this.flowSessionStore) {
      const sess = await this.flowSessionStore.getSession(instanceId, chatId);
      if (sess) {
        if (!state) {
          state = { instanceId, chatId, variables: {} } as IConversationState;
        }
        // merge into state
        state.currentFlowId = state.currentFlowId ?? sess.currentFlowId;
        state.currentNodeId = state.currentNodeId ?? sess.currentNodeId;
        state.variables = { ...(state.variables ?? {}), ...(sess.variables ?? {}) };
      }
    }
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
    state!.variables = { ...(state!.variables ?? {}), ...(result.variables ?? {}) };
    await this.store.set(instanceId, chatId, state!);
    // Persist flow execution state if flowSessionStore is configured
    if (this.flowSessionStore && state!.currentFlowId) {
      const toStore: { currentFlowId?: string; currentNodeId?: string; variables?: any } = {
        currentFlowId: state!.currentFlowId,
        currentNodeId: state!.currentNodeId,
        variables: state!.variables,
      };
      await (this.flowStore as any); // placeholder to keep type resolution happy
      await (this.flowSessionStore as any).setSession(instanceId, chatId, toStore as any);
    }

    // responder si hay mensaje
    if ((result as any).reply) {
      await this.messaging.sendText(chatId, (result as any).reply);
    }
  }
}
