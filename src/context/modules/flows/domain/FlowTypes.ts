export type NodeId = string;

export type FlowNode = IMessageNode | INodeInput | IConditionNode | IAINode;

export type NodeType = 'message' | 'input' | 'condition' | 'ai' | 'delay';

export type Nodes = Record<NodeId, FlowNode>;

export interface IBaseNode {
  id: NodeId;
  type: NodeType;
}

export interface IMessageNode extends IBaseNode {
  type: 'message';
  text: string;
  next: NodeId | null;
}

export interface INodeInput extends IBaseNode {
  type: 'input';
  variable: string;
  next: NodeId | null;
}

export interface IConditionNode extends IBaseNode {
  type: 'condition';
  variable: string;
  equals: string;
  ifTrue: NodeId;
  ifFalse: NodeId;
  next: null;
}

export interface IDelayNode extends IBaseNode {
  type: 'delay';
  ms: number;
  next: NodeId | null;
}

export interface IAINode extends IBaseNode {
  type: 'ai';
  prompt: string;
  saveAs?: string; // variable donde guardar respuesta
  next: NodeId | null;
}

export type Trigger = {
  type: 'keyword' | 'contains';
  value: string;
};

export interface IFlow {
  flowId: string;
  instanceId: string;
  name: string;
  version: number;
  start: NodeId;
  nodes: Record<NodeId, FlowNode>;
  triggers?: Trigger[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INodeExecutionResult {
  reply?: string;
  nextNodeId?: NodeId | null;
  variables?: Record<string, any>;
  isEnd?: boolean;
}

export function isMessageNode(node: FlowNode): node is IMessageNode {
  return node.type === 'message';
}

export function isInputNode(node: FlowNode): node is INodeInput {
  return node.type === 'input';
}

export function isConditionNode(node: FlowNode): node is IConditionNode {
  return node.type === 'condition';
}
