import { FlowId } from '@domain/value-objects/FlowId';

import { FlowNode, IFlow } from '@application/bot/types/FlowTypes';

type UINode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
};

type UIEdge = {
  source: string;
  target: string;
};

export class FlowMapper {
  static toDomain(nodes: UINode[], edges: UIEdge[]): Partial<IFlow> {
    const flowNodes: Record<string, FlowNode> = {};

    for (const node of nodes) {
      const next = edges.find((e) => e.source === node.id)?.target;

      switch (node.type) {
        case 'message':
          flowNodes[node.id] = {
            id: node.id,
            type: 'message',
            text: node.data.text,
            next: next ?? null,
          };
          break;

        case 'input':
          flowNodes[node.id] = {
            id: node.id,
            type: 'input',
            variable: node.data.variable,
            next: next ?? null,
          };
          break;

        case 'ai':
          flowNodes[node.id] = {
            id: node.id,
            type: 'ai',
            prompt: node.data.prompt,
            next: next ?? null,
          };
          break;
      }
    }

    return {
      flowId: FlowId.create().value,
      start: nodes[0].id,
      nodes: flowNodes,
    };
  }
}
