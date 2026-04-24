import { FlowId } from '@domain/value-objects/FlowId';
import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';

import { FlowNode, IFlow, NodeId, Trigger } from '@application/services/bot/FlowTypes';

import { AggregateRoot } from '@shared/domain/AggregateRoot';

export class FlowDefinitionAggregate extends AggregateRoot<string> {
  private _instanceId: InstanceId;
  private _name: Name;
  private _version: number;
  private _startNode: NodeId;
  private _nodes: Record<NodeId, FlowNode>;
  private _isActive: boolean;
  private _triggers: Trigger[];

  private constructor(props: {
    id: FlowId;
    instanceId: InstanceId;
    name: Name;
    version: number;
    startNode: NodeId;
    nodes: Record<NodeId, FlowNode>;
    isActive?: boolean;
    triggers?: Trigger[];
  }) {
    super(props.id.value);

    this._instanceId = props.instanceId;
    this._name = props.name;
    this._startNode = props.startNode;
    this._nodes = props.nodes;
    this._version = props.version;
    this._isActive = props.isActive ?? true;
    this._triggers = props.triggers ?? [];

    this.validate();
  }

  static create(instanceId: string, name: string): FlowDefinitionAggregate {
    return new FlowDefinitionAggregate({
      id: FlowId.create(),
      instanceId: InstanceId.fromString(instanceId),
      name: Name.create(name),
      version: 1,
      startNode: 'start',
      nodes: {},
    });
  }

  updateNodes(nodes: Record<NodeId, FlowNode>, startNode: NodeId): void {
    this._nodes = nodes;
    this._startNode = startNode;
    this.validate();
  }

  activate(): void {
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  getFlow(): IFlow {
    return {
      id: this.id,
      instanceId: this._instanceId.value,
      name: this._name.value,
      version: this._version,
      isActive: this._isActive,
      start: this._startNode,
      nodes: this._nodes,
      triggers: this._triggers,
    };
  }

  get flowId(): string {
    return this._id;
  }

  get instanceId(): InstanceId {
    return this._instanceId;
  }

  get name(): Name {
    return this._name;
  }

  get version(): number {
    return this._version;
  }

  get startNode(): NodeId {
    return this._startNode;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get nodes(): Record<NodeId, FlowNode> {
    return this._nodes;
  }

  get triggers(): Trigger[] {
    return this._triggers;
  }

  protected validate(): void {
    if (!this._nodes[this._startNode]) {
      throw new Error('Start node not found in nodes');
    }
  }
}
