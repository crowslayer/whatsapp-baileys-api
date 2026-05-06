import { INodeExecutionResult, INodeInput, NodeType } from '@application/bot/types/FlowTypes';
import { IConversationState } from '@application/bot/types/IConversationState';
import { INodeExecutor } from '@application/bot/types/INodeExecutor';

type Params = { node: INodeInput; state: IConversationState; input?: string };

export class InputNodeExecutor implements INodeExecutor<INodeInput> {
  supports(type: NodeType): boolean {
    return type === 'input';
  }

  execute({ node, state, input }: Params): INodeExecutionResult {
    return {
      variables: {
        ...state.variables,
        [node.variable]: input?.trim().toLowerCase(),
      },
      nextNodeId: node.next,
    };
  }
}
