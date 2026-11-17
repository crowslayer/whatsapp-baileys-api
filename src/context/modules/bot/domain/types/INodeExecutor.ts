import { IConversationState } from '@modules/bot/domain/types/IConversationState';
import { FlowNode, INodeExecutionResult, NodeType } from '@modules/flows/domain/FlowTypes';

export interface INodeExecutor<T extends FlowNode = FlowNode> {
  supports(type: NodeType): boolean;

  execute(params: { node: T; state: IConversationState; input?: string }): INodeExecutionResult;
}
