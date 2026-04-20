export type NodeId = string;

export type FlowNode = IMessageNode | INodeInput | IConditionNode;

export interface IBaseNode {
  id: NodeId;
  type: string;
}

export interface IMessageNode extends IBaseNode {
  type: 'message';
  text: string;
  next?: NodeId;
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
