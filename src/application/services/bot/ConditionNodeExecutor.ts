import {
  IConditionNode,
  INodeExecutionResult,
  NodeType,
} from '@application/services/bot/FlowTypes';
import { IConversationState } from '@application/services/bot/IConversationState';
import { INodeExecutor } from '@application/services/bot/INodeExecutor';

export class ConditionNodeExecutor implements INodeExecutor<IConditionNode> {
  supports(type: NodeType): boolean {
    return type === 'condition';
  }

  execute({
    node,
    state,
  }: {
    node: IConditionNode;
    state: IConversationState;
  }): INodeExecutionResult {
    const value = state.variables[node.variable];

    return {
      nextNodeId: value === node.equals ? node.ifTrue : node.ifFalse,
    };
  }
}
