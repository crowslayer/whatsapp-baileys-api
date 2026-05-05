import { IMessageNode, INodeExecutionResult, NodeType } from '@application/bot/types/FlowTypes';
import { IConversationState } from '@application/bot/types/IConversationState';
import { INodeExecutor } from '@application/bot/types/INodeExecutor';

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
