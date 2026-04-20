import { FlowNode, INodeExecutionResult, NodeType } from '@application/services/bot/FlowTypes';
import { IConversationState } from '@application/services/bot/IConversationState';

export interface INodeExecutor<T extends FlowNode = FlowNode> {
  supports(type: NodeType): boolean;

  execute(params: { node: T; state: IConversationState; input?: string }): INodeExecutionResult;
}
