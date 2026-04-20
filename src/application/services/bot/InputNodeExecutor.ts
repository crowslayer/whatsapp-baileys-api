import { INodeExecutionResult, INodeInput, NodeType } from '@application/services/bot/FlowTypes';
import { IConversationState } from '@application/services/bot/IConversationState';
import { INodeExecutor } from '@application/services/bot/INodeExecutor';

type Params = { node: INodeInput; state: IConversationState; input?: string };

export class InputNodeExecutor implements INodeExecutor<INodeInput> {
  supports(type: NodeType): boolean {
    return type === 'input';
  }

  execute({ node, state, input }: Params): INodeExecutionResult {
    return {
      variables: {
        ...state.variables,
        [node.variable]: input,
      },
      nextNodeId: node.next,
    };
  }
}
