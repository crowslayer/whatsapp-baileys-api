import { IConversationState } from '@modules/bot/domain/types/IConversationState';
import { INodeExecutor } from '@modules/bot/domain/types/INodeExecutor';
import { IConditionNode, INodeExecutionResult, NodeType } from '@modules/flows/domain/FlowTypes';

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
