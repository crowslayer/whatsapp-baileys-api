import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AggregateRoot } from '@shared/domain/AggregateRoot';

import { FlowAggregate } from '@modules/flows/domain/FlowAggregate';
import { FlowId } from '@modules/flows/domain/FlowId';
import { FlowNode, IFlow, Nodes, Trigger } from '@modules/flows/domain/FlowTypes';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { Name } from '@modules/instances/domain/Name';

const FLOW_UUID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e1f';
const INSTANCE_UUID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f';
const OTHER_INSTANCE_UUID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e3f';

const buildNodes = (): Nodes => ({
  welcome: { id: 'welcome', type: 'message', text: 'Hello there', next: null },
});

const buildAggregate = (): FlowAggregate =>
  FlowAggregate.restore({
    flowId: FlowId.fromString(FLOW_UUID),
    instanceId: InstanceId.fromString(INSTANCE_UUID),
    name: Name.create('Sales Flow'),
    version: 3,
    start: 'welcome',
    nodes: buildNodes(),
    triggers: [{ type: 'keyword', value: 'hola' }],
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  });

describe('FlowAggregate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('creates an aggregate with default values', () => {
      const aggregate = FlowAggregate.create(
        InstanceId.fromString(INSTANCE_UUID),
        Name.create('Sales Flow')
      );

      expect(aggregate).toBeInstanceOf(FlowAggregate);
      expect(aggregate).toBeInstanceOf(AggregateRoot);
      expect(aggregate.version).toBe(1);
      expect(aggregate.start).toBe('start');
      expect(aggregate.nodes).toEqual({});
      expect(aggregate.triggers).toEqual([]);
      expect(aggregate.isActive).toBe(false);
    });

    it('keeps the provided instance and name', () => {
      const aggregate = FlowAggregate.create(
        InstanceId.fromString(INSTANCE_UUID),
        Name.create('Sales Flow')
      );

      expect(aggregate.instanceId.value).toBe(INSTANCE_UUID);
      expect(aggregate.name.value).toBe('Sales Flow');
    });

    it('generates a valid flow identifier', () => {
      const aggregate = FlowAggregate.create(
        InstanceId.fromString(INSTANCE_UUID),
        Name.create('Sales Flow')
      );

      expect(aggregate.flowId).toBeInstanceOf(FlowId);
      expect(aggregate.id).toBe(aggregate.flowId.value);
    });
  });

  describe('restore', () => {
    it('restores all the persisted state', () => {
      const aggregate = buildAggregate();

      expect(aggregate.id).toBe(FLOW_UUID);
      expect(aggregate.instanceId.value).toBe(INSTANCE_UUID);
      expect(aggregate.name.value).toBe('Sales Flow');
      expect(aggregate.version).toBe(3);
      expect(aggregate.start).toBe('welcome');
      expect(aggregate.isActive).toBe(true);
      expect(aggregate.triggers).toEqual([{ type: 'keyword', value: 'hola' }]);
    });

    it('restores an aggregate without nodes', () => {
      const aggregate = FlowAggregate.restore({
        flowId: FlowId.fromString(FLOW_UUID),
        instanceId: InstanceId.fromString(INSTANCE_UUID),
        name: Name.create('Sales Flow'),
        version: 1,
        start: 'start',
        nodes: {},
      });

      expect(aggregate.nodes).toEqual({});
      expect(aggregate.triggers).toEqual([]);
      expect(aggregate.isActive).toBe(true);
    });

    it('throws when the start node is not part of the nodes', () => {
      expect(() =>
        FlowAggregate.restore({
          flowId: FlowId.fromString(FLOW_UUID),
          instanceId: InstanceId.fromString(INSTANCE_UUID),
          name: Name.create('Sales Flow'),
          version: 1,
          start: 'missing',
          nodes: buildNodes(),
        })
      ).toThrow('Start node not found in nodes');
    });
  });

  describe('changeInstance', () => {
    it('changes the instance when it is different', () => {
      const aggregate = buildAggregate();

      aggregate.changeInstance(InstanceId.fromString(OTHER_INSTANCE_UUID));

      expect(aggregate.instanceId.value).toBe(OTHER_INSTANCE_UUID);
    });

    it('keeps the same instance when it is equal', () => {
      const aggregate = buildAggregate();

      aggregate.changeInstance(InstanceId.fromString(INSTANCE_UUID));

      expect(aggregate.instanceId.value).toBe(INSTANCE_UUID);
    });
  });

  describe('rename', () => {
    it('renames the aggregate', () => {
      const aggregate = buildAggregate();

      aggregate.rename(Name.create('Support Flow'));

      expect(aggregate.name.value).toBe('Support Flow');
    });

    it('keeps the same name when it is equal', () => {
      const aggregate = buildAggregate();

      aggregate.rename(Name.create('Sales Flow'));

      expect(aggregate.name.value).toBe('Sales Flow');
    });

    it('throws when the new name is invalid', () => {
      const aggregate = buildAggregate();

      expect(() => aggregate.rename(Name.create('a'))).toThrow();
      expect(aggregate.name.value).toBe('Sales Flow');
    });
  });

  describe('updateNodes', () => {
    it('replaces the nodes and the start node', () => {
      const aggregate = buildAggregate();
      const nodes: Nodes = {
        greeting: { id: 'greeting', type: 'message', text: 'Hi', next: 'ask' },
        ask: { id: 'ask', type: 'input', variable: 'name', next: null },
      };

      aggregate.updateNodes(nodes, 'greeting');

      expect(aggregate.nodes).toEqual(nodes);
      expect(aggregate.start).toBe('greeting');
    });

    it('accepts an empty node collection', () => {
      const aggregate = buildAggregate();

      aggregate.updateNodes({}, 'start');

      expect(aggregate.nodes).toEqual({});
      expect(aggregate.start).toBe('start');
    });

    it('throws when the start node is not part of the new nodes', () => {
      const aggregate = buildAggregate();

      expect(() => aggregate.updateNodes(buildNodes(), 'missing')).toThrow(
        'Start node not found in nodes'
      );
    });
  });

  describe('addTriggers', () => {
    it('replaces the triggers with the provided ones', () => {
      const aggregate = buildAggregate();

      aggregate.addTriggers([{ type: 'contains', value: 'precio' }]);

      expect(aggregate.triggers).toEqual([{ type: 'contains', value: 'precio' }]);
    });

    it('does nothing when the trigger list is empty', () => {
      const aggregate = buildAggregate();

      aggregate.addTriggers([]);

      expect(aggregate.triggers).toEqual([{ type: 'keyword', value: 'hola' }]);
    });

    it('does nothing when the trigger list is not an array', () => {
      const aggregate = buildAggregate();

      aggregate.addTriggers(undefined as unknown as Trigger[]);

      expect(aggregate.triggers).toEqual([{ type: 'keyword', value: 'hola' }]);
    });
  });

  describe('addTrigger', () => {
    it('appends the trigger to the existing ones', () => {
      const aggregate = buildAggregate();

      aggregate.addTrigger({ type: 'contains', value: 'precio' });

      expect(aggregate.triggers).toEqual([
        { type: 'keyword', value: 'hola' },
        { type: 'contains', value: 'precio' },
      ]);
    });

    it('ignores a nullish trigger', () => {
      const aggregate = buildAggregate();

      aggregate.addTrigger(undefined as unknown as Trigger);

      expect(aggregate.triggers).toEqual([{ type: 'keyword', value: 'hola' }]);
    });
  });

  describe('activate and deactivate', () => {
    it('activates the aggregate', () => {
      const aggregate = FlowAggregate.create(
        InstanceId.fromString(INSTANCE_UUID),
        Name.create('Sales Flow')
      );

      aggregate.activate();

      expect(aggregate.isActive).toBe(true);
    });

    it('deactivates the aggregate', () => {
      const aggregate = buildAggregate();

      aggregate.deactivate();

      expect(aggregate.isActive).toBe(false);
    });
  });

  describe('resetNodes', () => {
    it('clears the nodes and the triggers', () => {
      const aggregate = buildAggregate();

      aggregate.resetNodes();

      expect(aggregate.nodes).toEqual({});
      expect(aggregate.triggers).toEqual([]);
    });
  });

  describe('getFlow', () => {
    it('returns the flow projection', () => {
      const aggregate = buildAggregate();

      const flow: IFlow = aggregate.getFlow();

      expect(flow.flowId).toBe(FLOW_UUID);
      expect(flow.instanceId).toBe(INSTANCE_UUID);
      expect(flow.name).toBe('Sales Flow');
      expect(flow.version).toBe(3);
      expect(flow.start).toBe('welcome');
      expect(flow.isActive).toBe(true);
      expect(flow.nodes).toEqual(buildNodes());
      expect(flow.triggers).toEqual([{ type: 'keyword', value: 'hola' }]);
    });

    it('always returns an array of triggers', () => {
      const aggregate = buildAggregate();

      aggregate.resetNodes();

      expect(aggregate.getFlow().triggers).toEqual([]);
    });
  });

  describe('domain events', () => {
    it('starts without domain events', () => {
      const aggregate = buildAggregate();

      expect(aggregate.domainEvents).toEqual([]);
    });

    it('pulls an empty list of domain events', () => {
      const aggregate = buildAggregate();

      expect(aggregate.pullDomainEvents()).toEqual([]);
    });
  });

  describe('nodes collection', () => {
    it('exposes the nodes as a record of flow nodes', () => {
      const aggregate = buildAggregate();
      const nodes: Record<string, FlowNode> = aggregate.nodes;

      expect(Object.keys(nodes)).toEqual(['welcome']);
    });
  });
});
