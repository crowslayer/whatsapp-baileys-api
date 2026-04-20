import { IFlow, INodeExecutionResult } from '@application/services/bot/FlowTypes';
import { IConversationState } from '@application/services/bot/IConversationState';
import { INodeExecutor } from '@application/services/bot/INodeExecutor';

export class FlowEngine {
  constructor(private executors: INodeExecutor[]) {}

  execute(flow: IFlow, state: IConversationState, input?: string): INodeExecutionResult {
    if (state.currentNodeId === undefined) {
      throw new Error('Flow is undefined');
    }

    const node = flow.nodes[state.currentNodeId];

    if (!node) {
      throw new Error('Node not found');
    }

    const executor = this.executors.find((e) => e.supports(node.type));

    if (!executor) {
      throw new Error(`No executor for node type: ${node.type}`);
    }

    return executor.execute({ node, state, input });
  }
}
