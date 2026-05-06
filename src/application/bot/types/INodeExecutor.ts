import { FlowNode, INodeExecutionResult, NodeType } from '@application/bot/types/FlowTypes';
import { IConversationState } from '@application/bot/types/IConversationState';

export interface INodeExecutor<T extends FlowNode = FlowNode> {
  supports(type: NodeType): boolean;

  execute(params: { node: T; state: IConversationState; input?: string }): INodeExecutionResult;
}
