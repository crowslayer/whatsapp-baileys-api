import { IConversationState } from '@modules/bot/domain/types/IConversationState';
import { INodeExecutor } from '@modules/bot/domain/types/INodeExecutor';
import { INodeExecutionResult, INodeInput, NodeType } from '@modules/flows/domain/FlowTypes';

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
