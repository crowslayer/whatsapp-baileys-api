import { IFlowReadRepository } from '@domain/queries/IFlowReadRepository';

import { FlowEngine } from '@application/bot/FlowEngine';
import { FlowTriggerResolver } from '@application/bot/FlowTriggerResolver';
import { IFlow } from '@application/bot/types/FlowTypes';
import { IConversationStore } from '@application/bot/types/IConversationStore';
import { MessageOrchestrator } from '@application/services/MessageOrchestrator';

import { ILogger } from '@infrastructure/loggers/Logger';

export interface IProcessBotMessageRequest {
  instanceId: string;
  conversationId: string;
  messageId: string;
  senderId: string;
  text: string;
}

export class BotService {
  constructor(
    private readonly flowEngine: FlowEngine,
    private readonly tiggerResolver: FlowTriggerResolver,
    private readonly store: IConversationStore,
    private readonly messaging: MessageOrchestrator,
    private readonly flowRepository: IFlowReadRepository,
    private readonly logger: ILogger
  ) {}

  async handleMessage(request: IProcessBotMessageRequest): Promise<void> {
    const { instanceId, conversationId, text } = request;

    let state = await this.store.get(instanceId, conversationId);
    let isNewFlow = false;

    this.logger.info('Conversation initialized');

    if (!state) {
      state = {
        instanceId,
        chatId: conversationId,
        currentFlowId: undefined,
        currentNodeId: undefined,
        variables: {},
      };
    }

    let flow: IFlow | null = null;

    // si no hay flujo activo, resolver uno por defecto
    if (!state?.currentFlowId) {
      const flows = await this.flowRepository.findActiveByInstance(instanceId);
      flow = this.tiggerResolver.resolve(flows, text);

      if (!flow) return;

      state.currentFlowId = flow.flowId;
      state.currentNodeId = flow.start;

      isNewFlow = true;
    } else {
      flow = await this.flowRepository.findById(state.currentFlowId);
    }

    if (!flow || !flow.nodes) {
      this.logger.warn('Flow missing nodes', flow);
      return;
    }

    const result = this.flowEngine.execute(flow, state, isNewFlow ? undefined : text);

    if (!state.currentNodeId) {
      state.currentFlowId = undefined;
    }

    // actualizar estado
    state.variables = result.variables ?? state.variables;

    await this.store.set(instanceId, conversationId, state);

    // responder si hay mensaje
    if (result.reply) {
      this.logger.info('bot response in instance', { instanceId });
      await this.messaging.send(instanceId, conversationId, result.reply);
    }
  }
}
