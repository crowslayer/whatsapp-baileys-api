import { IConditionNode, INodeExecutionResult, NodeType } from '@application/bot/types/FlowTypes';
import { IConversationState } from '@application/bot/types/IConversationState';
import { INodeExecutor } from '@application/bot/types/INodeExecutor';

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
