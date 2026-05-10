import { FlowAggregate } from '../../src/domain/Aggregates/FlowAggregate'
import { FlowId } from '../../src/domain/value-objects/FlowId'
import { InstanceId } from '../../src/domain/value-objects/InstanceId'
import { Name } from '../../src/domain/value-objects/Name'

import type { FlowNode } from '../../src/application/bot/types/FlowTypes'
type NodeId = string

describe('FlowAggregate unit tests', () => {
  const makeNodes = (): Record<NodeId, FlowNode> => {
    return {
      start: {
        id: 'start',
        type: 'message',
        text: 'Start',
        next: null,
      } as any,
    } as Record<NodeId, FlowNode>
  }

  test('should create aggregate with valid nodes and expose flow data', () => {
    const flowId = FlowId.fromString('flow-1')
    const instanceId = InstanceId.fromString('inst-1')
    const name = Name.create('Test Flow')
    const nodes = makeNodes()
    const props = {
      flowId,
      instanceId,
      name,
      version: 1,
      start: 'start',
      nodes,
      isActive: true,
    } as any
    const agg = FlowAggregate.restore(props)
    const f = agg.getFlow()
    expect(f.flowId).toBe(flowId.value)
    expect(f.instanceId).toBe(instanceId.value)
    expect(f.name).toBe(name.value)
    expect(f.version).toBe(1)
    expect(f.start).toBe('start')
    expect(f.nodes).toEqual(nodes)
  })

  test('should rename flow and update instance', () => {
    const flowId = FlowId.fromString('flow-rename')
    const instanceId = InstanceId.fromString('inst-rename')
    const name = Name.create('OldName')
    const nodes = makeNodes()
    const agg = FlowAggregate.restore({ flowId, instanceId, name, version: 1, start: 'start', nodes, isActive: true } as any)
    agg.rename(Name.create('NEWNAME'))
    expect(agg.getFlow().name).toBe('NEWNAME')
  })

  test('should update nodes and start', () => {
    const flowId = FlowId.fromString('flow-update')
    const instanceId = InstanceId.fromString('inst-update')
    const name = Name.create('Flow')
    const nodes = makeNodes()
    const agg = FlowAggregate.restore({ flowId, instanceId, name, version: 1, start: 'start', nodes, isActive: true } as any)
    const newNodes: any = {
      start: { id: 'start', type: 'message', text: 'Start', next: null }
    }
    agg.updateNodes(newNodes, 'start')
    expect(agg.nodes).toEqual(newNodes)
  })

  test('should add triggers', () => {
    const flowId = FlowId.fromString('flow-trigger')
    const instanceId = InstanceId.fromString('inst-trigger')
    const name = Name.create('Flow')
    const nodes = makeNodes()
    const agg = FlowAggregate.restore({ flowId, instanceId, name, version: 1, start: 'start', nodes, isActive: true } as any)
    agg.addTrigger({ type: 'keyword', value: 'hello' } as any)
    expect(agg.getFlow().triggers?.length).toBeGreaterThan(0)
  })
})

describe('FlowAggregate validation', () => {
  test('should throw if start node not present', () => {
    const flowId = FlowId.fromString('flow-invalid')
    const instanceId = InstanceId.fromString('inst-invalid')
    const name = Name.create('Invalid')
    const nodes = { existing: { id: 'existing', type: 'message', text: 'Hi', next: null } } as any
    const props = { flowId, instanceId, name, version: 1, start: 'missing', nodes, isActive: true } as any
    expect(() => FlowAggregate.restore(props)).toThrow()
  })
})
