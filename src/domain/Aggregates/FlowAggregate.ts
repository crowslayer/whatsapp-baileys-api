import { FlowId } from '@domain/value-objects/FlowId';
import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';

import { FlowNode, IFlow, NodeId, Nodes, Trigger } from '@application/bot/types/FlowTypes';

import { AggregateRoot } from '@shared/domain/AggregateRoot';

type FlowProps = {
  flowId: FlowId;
  instanceId: InstanceId;
  name: Name;
  version: number;
  start: NodeId;
  nodes: Nodes;
  isActive?: boolean;
  triggers?: Trigger[];
  createdAt?: Date;
  updatedAt?: Date;
};

export class FlowAggregate extends AggregateRoot<string> {
  private _flowId: FlowId;
  private _instanceId: InstanceId;
  private _name: Name;
  private _version: number;
  private _start: NodeId;
  private _nodes: Record<NodeId, FlowNode>;
  private _triggers?: Trigger[];
  private _isActive: boolean;
  private _createdAt?: Date;
  private _updatedAt?: Date;

  private constructor(props: FlowProps) {
    super(props.flowId.value);

    this._flowId = props.flowId;
    this._instanceId = props.instanceId;
    this._name = props.name;
    this._start = props.start;
    this._version = props.version;
    this._nodes = props.nodes;
    this._triggers = props.triggers ?? [];
    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt ?? undefined;
    this._updatedAt = props.updatedAt ?? undefined;

    this.validate();
  }

  static create(instanceId: InstanceId, name: Name): FlowAggregate {
    const now = new Date();
    return new FlowAggregate({
      flowId: FlowId.create(),
      instanceId,
      name,
      version: 1,
      start: 'start',
      nodes: {},
      triggers: [],
      isActive: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: FlowProps): FlowAggregate {
    return new FlowAggregate(props);
  }

  changeInstance(instanceId: InstanceId): void {
    if (this._instanceId.equals(instanceId)) {
      return;
    }
    this._instanceId = instanceId;
    this._updatedAt = new Date();
  }

  rename(name: Name): void {
    if (this._name.equals(name)) {
      return;
    }
    this._name = name;
    this._updatedAt = new Date();
  }

  updateNodes(nodes: Record<NodeId, FlowNode>, start: NodeId): void {
    this._nodes = nodes;
    this._start = start;
    this._updatedAt = new Date();
    this.validate();
  }

  addTriggers(triggers: Trigger[]): void {
    if (Array.isArray(triggers) && triggers.length > 0) {
      this._triggers = triggers;
      this._updatedAt = new Date();
    }
  }

  addTrigger(trigger: Trigger): void {
    if (!trigger) return;

    this.triggers.push(trigger);
    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  resetNodes(): void {
    this._nodes = {};
    this._triggers = [];
    this._updatedAt = new Date();
  }

  getFlow(): IFlow {
    return {
      flowId: this.id,
      instanceId: this._instanceId.value,
      name: this._name.value,
      version: this._version,
      isActive: this._isActive,
      start: this._start,
      nodes: this._nodes,
      triggers: this._triggers,
    };
  }

  get flowId(): FlowId {
    return this._flowId;
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

  get start(): NodeId {
    return this._start;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get nodes(): Record<NodeId, FlowNode> {
    return this._nodes;
  }

  get triggers(): Trigger[] {
    return this._triggers ?? [];
  }

  protected validate(): void {
    if (!this._nodes[this._start]) {
      throw new Error('Start node not found in nodes');
    }
  }
}
