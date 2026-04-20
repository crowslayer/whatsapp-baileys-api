import { IFlow } from '@application/services/bot/FlowTypes';
import { IConversationState } from '@application/services/bot/IConversationState';

export class FlowEngine {
  execute(
    flow: IFlow,
    state: IConversationState,
    input?: string
  ): {
    reply?: string;
    nextNodeId?: string;
    updatedVariables?: Record<string, any>;
  } {
    if (state.currentNodeId === undefined) {
      throw new Error('Flow is undefined');
    }

    const node = flow.nodes[state.currentNodeId];

    if (!node) {
      throw new Error('Node not found');
    }

    const type = node.type;
    switch (type) {
      case 'message':
        return {
          reply: this.interpolate(node.text, state.variables),
          nextNodeId: node.next,
        };

      case 'input':
        return {
          updatedVariables: {
            ...state.variables,
            [node.variable]: input,
          },
          nextNodeId: node.next,
        };

      case 'condition':
        return {
          nextNodeId: state.variables[node.variable] === node.equals ? node.ifTrue : node.ifFalse,
        };

      default:
        throw new Error(`Unknown node type: ${type}`);
    }
  }

  private interpolate(text: string, vars: Record<string, any>): string {
    return text.replace(/\{\{(.*?)\}\}/g, (_, key) => {
      return vars[key.trim()] ?? '';
    });
  }
}
