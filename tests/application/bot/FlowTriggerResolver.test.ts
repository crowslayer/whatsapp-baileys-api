import { FlowTriggerResolver } from '../../../src/application/bot/FlowTriggerResolver'
import type { IFlow } from '../../../src/application/bot/types/FlowTypes'

function makeFlow(id: string, triggers: { type: 'keyword' | 'contains'; value: string }[]): IFlow {
  return {
    flowId: id, instanceId: 'i1', name: id, version: 1,
    start: 'start', nodes: {}, isActive: true, triggers,
  }
}

describe('FlowTriggerResolver', () => {
  const resolver = new FlowTriggerResolver()

  test('should return null for empty flows', () => {
    expect(resolver.resolve([], 'hello')).toBeNull()
  })

  test('should match keyword trigger exactly', () => {
    const flows = [makeFlow('f1', [{ type: 'keyword', value: 'hello' }])]
    expect(resolver.resolve(flows, 'hello')?.flowId).toBe('f1')
  })

  test('should not match keyword with partial', () => {
    const flows = [makeFlow('f1', [{ type: 'keyword', value: 'hello' }])]
    expect(resolver.resolve(flows, 'hello world')).toBeNull()
  })

  test('should match contains trigger', () => {
    const flows = [makeFlow('f1', [{ type: 'contains', value: 'help' }])]
    expect(resolver.resolve(flows, 'I need help now')?.flowId).toBe('f1')
  })

  test('should return first matching flow', () => {
    const flows = [
      makeFlow('f1', [{ type: 'keyword', value: 'hi' }]),
      makeFlow('f2', [{ type: 'keyword', value: 'hello' }]),
    ]
    expect(resolver.resolve(flows, 'hello')?.flowId).toBe('f2')
  })

  test('should normalize case', () => {
    const flows = [makeFlow('f1', [{ type: 'keyword', value: 'HELLO' }])]
    expect(resolver.resolve(flows, 'Hello')?.flowId).toBe('f1')
  })

  test('should handle no triggers on flow', () => {
    const flows = [makeFlow('f1', [])]
    expect(resolver.resolve(flows, 'hello')).toBeNull()
  })
})
