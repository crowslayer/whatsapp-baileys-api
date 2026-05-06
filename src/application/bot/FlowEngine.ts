import { IFlow, INodeExecutionResult } from '@application/bot/types/FlowTypes';
import { IConversationState } from '@application/bot/types/IConversationState';
import { INodeExecutor } from '@application/bot/types/INodeExecutor';

import { ILogger } from '@infrastructure/loggers/Logger';

export class FlowEngine {
  constructor(
    private readonly executors: INodeExecutor[],
    private readonly logger: ILogger
  ) {}

  execute(flow: IFlow, state: IConversationState, input?: string): INodeExecutionResult {
    if (!state.currentNodeId) {
      this.logger.warn('No current node, skipping execution');
      return { variables: state.variables };
    }

    let currentNodeId = state.currentNodeId;
    let lastResult: INodeExecutionResult = { variables: state.variables };

    while (currentNodeId) {
      this.logger.info('STATE BEFORE NODE', { currentNodeId, variables: state.variables });
      const node = flow.nodes[currentNodeId];

      if (!node) {
        this.logger.warn(`Node "${state.currentNodeId}" not found in flow "${flow.flowId}"`);
        return { variables: state.variables };
      }

      const executor = this.executors.find((e) => e.supports(node.type));

      if (!executor) throw Error(`No executor for ${node.type}`);

      const result = executor.execute({
        node,
        state,
        input: node.type === 'input' ? input : undefined,
      });

      // merge variables
      if (result.variables) state.variables = result.variables;

      lastResult = {
        ...result,
        reply: result.reply ?? lastResult.reply,
      };

      // STOP si es input
      if (node.type === 'input') {
        if (input === undefined) break;

        state.currentNodeId = result.nextNodeId ?? undefined;
        // input = undefined;
      }

      // FIN
      if (result.isEnd || !result.nextNodeId) {
        state.currentNodeId = undefined;
        this.logger.info(`Node finish in flow ${flow.flowId}`);
        break;
      }
      // avanza automatico
      currentNodeId = result.nextNodeId;
      state.currentNodeId = currentNodeId;
      // log de prueba
      // this.logger.info('Node execution', {
      //   node: node.type,
      //   reply: result.reply,
      //   next: result.nextNodeId,
      // });

      // this.logger.info('STATE AFTER NODE', {
      //   nextNodeId: state.currentNodeId,
      //   variables: state.variables,
      // });
    }
    return lastResult;
  }
}
