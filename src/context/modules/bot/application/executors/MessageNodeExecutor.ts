import { IConversationState } from '@modules/bot/domain/types/IConversationState';
import { INodeExecutor } from '@modules/bot/domain/types/INodeExecutor';
import { IMessageNode, INodeExecutionResult, NodeType } from '@modules/flows/domain/FlowTypes';

export class MessageNodeExecutor implements INodeExecutor<IMessageNode> {
  supports(type: NodeType): boolean {
    return type === 'message';
  }

  execute({
    node,
    state,
  }: {
    node: IMessageNode;
    state: IConversationState;
  }): INodeExecutionResult {
    const text = this.interpolate(node.text, state.variables);

    return {
      reply: text,
      nextNodeId: node.next,
      isEnd: node.next === null,
    };
  }

  private interpolate(text: string, vars: Record<string, any>): string {
    return text.replace(/\{\{(.*?)\}\}/g, (_, key) => {
      return vars[key.trim()] ?? '';
    });
  }
}
