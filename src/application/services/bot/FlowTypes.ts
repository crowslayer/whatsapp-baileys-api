export type NodeId = string;

export type FlowNode = IMessageNode | INodeInput | IConditionNode;

export type NodeType = 'message' | 'input' | 'condition';

export interface IBaseNode {
  id: NodeId;
  type: NodeType;
}

export interface IMessageNode extends IBaseNode {
  type: 'message';
  text: string;
  next?: NodeId | null;
}

export interface INodeInput extends IBaseNode {
  type: 'input';
  variable: string;
  next: NodeId;
}

export interface IConditionNode extends IBaseNode {
  type: 'condition';
  variable: string;
  equals: string;
  ifTrue: NodeId;
  ifFalse: NodeId;
}

export interface IFlow {
  id: string;
  start: NodeId;
  nodes: Record<NodeId, FlowNode>;
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
