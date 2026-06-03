import { FlowAggregate } from '../../../src/domain/aggregates/FlowAggregate';
import { FlowId } from '../../../src/domain/value-objects/FlowId';
import { InstanceId } from '../../../src/domain/value-objects/InstanceId';
import { Name } from '../../../src/domain/value-objects/Name';

import type { FlowNode } from '../../../src/application/bot/types/FlowTypes';
type NodeId = string;

describe('FlowAggregate unit tests', () => {
  const makeNodes = (): Record<NodeId, FlowNode> => {
    return {
      start: {
        id: 'start',
        type: 'message',
        text: 'Start',
        next: null,
      } as any,
    } as Record<NodeId, FlowNode>;
  };

  test('should create aggregate with valid nodes and expose flow data', () => {
    const flowId = FlowId.fromString('flow-1');
    const instanceId = InstanceId.fromString('inst-1');
    const name = Name.create('Test Flow');
    const nodes = makeNodes();
    const props = {
      flowId,
      instanceId,
      name,
      version: 1,
      start: 'start',
      nodes,
      isActive: true,
    } as any;
    const agg = FlowAggregate.restore(props);
    const f = agg.getFlow();
    expect(f.flowId).toBe(flowId.value);
    expect(f.instanceId).toBe(instanceId.value);
    expect(f.name).toBe(name.value);
    expect(f.version).toBe(1);
    expect(f.start).toBe('start');
    expect(f.nodes).toEqual(nodes);
  });

  test('should rename flow and update instance', () => {
    const flowId = FlowId.fromString('flow-rename');
    const instanceId = InstanceId.fromString('inst-rename');
    const name = Name.create('OldName');
    const nodes = makeNodes();
    const agg = FlowAggregate.restore({
      flowId,
      instanceId,
      name,
      version: 1,
      start: 'start',
      nodes,
      isActive: true,
    } as any);
    agg.rename(Name.create('NEWNAME'));
    expect(agg.getFlow().name).toBe('NEWNAME');
  });

  test('should update nodes and start', () => {
    const flowId = FlowId.fromString('flow-update');
    const instanceId = InstanceId.fromString('inst-update');
    const name = Name.create('Flow');
    const nodes = makeNodes();
    const agg = FlowAggregate.restore({
      flowId,
      instanceId,
      name,
      version: 1,
      start: 'start',
      nodes,
      isActive: true,
    } as any);
    const newNodes: any = {
      start: { id: 'start', type: 'message', text: 'Start', next: null },
    };
    agg.updateNodes(newNodes, 'start');
    expect(agg.nodes).toEqual(newNodes);
  });

  test('should add triggers', () => {
    const flowId = FlowId.fromString('flow-trigger');
    const instanceId = InstanceId.fromString('inst-trigger');
    const name = Name.create('Flow');
    const nodes = makeNodes();
    const agg = FlowAggregate.restore({
      flowId,
      instanceId,
      name,
      version: 1,
      start: 'start',
      nodes,
      isActive: true,
    } as any);
    agg.addTrigger({ type: 'keyword', value: 'hello' } as any);
    expect(agg.getFlow().triggers?.length).toBeGreaterThan(0);
  });
});

describe('FlowAggregate validation', () => {
  test('should throw if start node not present', () => {
    const flowId = FlowId.fromString('flow-invalid');
    const instanceId = InstanceId.fromString('inst-invalid');
    const name = Name.create('Invalid');
    const nodes = { existing: { id: 'existing', type: 'message', text: 'Hi', next: null } } as any;
    const props = {
      flowId,
      instanceId,
      name,
      version: 1,
      start: 'missing',
      nodes,
      isActive: true,
    } as any;
    expect(() => FlowAggregate.restore(props)).toThrow();
  });
});

describe('FlowAggregate state transitions', () => {
  test('deactivate() sets isActive to false', () => {
    const instanceId = InstanceId.fromString('inst-deact');
    const name = Name.create('Deactivate Flow');
    const agg = FlowAggregate.create(instanceId, name);
    agg.activate();
    expect(agg.isActive).toBe(true);
    agg.deactivate();
    expect(agg.isActive).toBe(false);
  });

  test('rename() updates the name', () => {
    const instanceId = InstanceId.fromString('inst-rename2');
    const name = Name.create('Original');
    const agg = FlowAggregate.create(instanceId, name);
    agg.rename(Name.create('Renamed'));
    expect(agg.name.value).toBe('Renamed');
  });

  test('changeInstance() updates instanceId', () => {
    const instanceId = InstanceId.fromString('inst-orig');
    const name = Name.create('Change Inst');
    const agg = FlowAggregate.create(instanceId, name);
    const newInstanceId = InstanceId.fromString('inst-new');
    agg.changeInstance(newInstanceId);
    expect(agg.instanceId.value).toBe('inst-new');
  });

  test('updateNodes(nodes, startId) updates nodes and start node', () => {
    const instanceId = InstanceId.fromString('inst-nodes');
    const name = Name.create('Nodes Flow');
    const agg = FlowAggregate.create(instanceId, name);
    const nodes: any = {
      start: { id: 'start', type: 'message', text: 'Hello', next: 'end' },
      end: { id: 'end', type: 'message', text: 'Goodbye', next: null },
    };
    agg.updateNodes(nodes, 'start');
    expect(agg.nodes).toEqual(nodes);
    expect(agg.start).toBe('start');
  });

  test('addTriggers() adds triggers to the aggregate', () => {
    const instanceId = InstanceId.fromString('inst-triggers');
    const name = Name.create('Triggers Flow');
    const agg = FlowAggregate.create(instanceId, name);
    const triggers = [{ type: 'keyword', value: 'hello' }] as any;
    agg.addTriggers(triggers);
    expect(agg.triggers).toEqual(triggers);
  });

  test('resetNodes() clears nodes, start node, and triggers', () => {
    const instanceId = InstanceId.fromString('inst-reset');
    const name = Name.create('Reset Flow');
    const agg = FlowAggregate.create(instanceId, name);
    agg.updateNodes(
      { start: { id: 'start', type: 'message', text: 'Hi', next: null } } as any,
      'start'
    );
    agg.addTriggers([{ type: 'keyword', value: 'test' }] as any);
    agg.resetNodes();
    expect(agg.nodes).toEqual({});
    expect(agg.triggers).toEqual([]);
  });

  test('restore recreates a flow aggregate with all properties', () => {
    const flowId = FlowId.fromString('flow-restore-all');
    const instanceId = InstanceId.fromString('inst-restore-all');
    const name = Name.create('Restored Flow');
    const nodes = { start: { id: 'start', type: 'message', text: 'Hi', next: null } as any };
    const triggers = [{ type: 'keyword', value: 'restore' }] as any;
    const agg = FlowAggregate.restore({
      flowId,
      instanceId,
      name,
      version: 2,
      start: 'start',
      nodes,
      triggers,
      isActive: true,
    } as any);
    expect(agg.flowId.value).toBe('flow-restore-all');
    expect(agg.instanceId.value).toBe('inst-restore-all');
    expect(agg.name.value).toBe('Restored Flow');
    expect(agg.version).toBe(2);
    expect(agg.start).toBe('start');
    expect(agg.nodes).toEqual(nodes);
    expect(agg.triggers).toEqual(triggers);
    expect(agg.isActive).toBe(true);
  });

  test('toJSON returns expected structure', () => {
    const instanceId = InstanceId.fromString('inst-tojson');
    const name = Name.create('ToJSON Flow');
    const agg = FlowAggregate.create(instanceId, name);
    const json = agg.getFlow();
    expect(json).toHaveProperty('flowId');
    expect(json).toHaveProperty('instanceId');
    expect(json).toHaveProperty('name');
    expect(json).toHaveProperty('version');
    expect(json).toHaveProperty('isActive');
    expect(json).toHaveProperty('start');
    expect(json).toHaveProperty('nodes');
    expect(json).toHaveProperty('triggers');
  });

  test('Validation: empty name throws', () => {
    expect(() => Name.create('')).toThrow();
  });

  test('Edge: updating nodes without the start node throws', () => {
    const instanceId = InstanceId.fromString('inst-empty-nodes');
    const name = Name.create('Empty Nodes');
    const agg = FlowAggregate.create(instanceId, name);
    const nodes = { other: { id: 'other', type: 'message', text: 'Hi', next: null } as any };
    expect(() => agg.updateNodes(nodes, 'missing')).toThrow('Start node not found in nodes');
  });

  test('Edge: restore with empty triggers', () => {
    const flowId = FlowId.fromString('flow-empty-triggers');
    const instanceId = InstanceId.fromString('inst-empty-triggers');
    const name = Name.create('Empty Triggers');
    const nodes = { start: { id: 'start', type: 'message', text: 'Hi', next: null } as any };
    const agg = FlowAggregate.restore({
      flowId,
      instanceId,
      name,
      version: 1,
      start: 'start',
      nodes,
      triggers: [],
      isActive: false,
    } as any);
    expect(agg.triggers).toEqual([]);
  });
});
