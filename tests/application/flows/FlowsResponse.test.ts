import { FlowsResponse } from '../../../src/application/flows/FlowsResponse'
import type { Flow } from '../../../src/domain/queries/IFlowReadRepository'

describe('FlowsResponse', () => {
  test('should create with flows array', () => {
    const flows: Flow[] = [
      { flowId: 'f1', instanceId: 'i1', name: 'F1', version: 1, start: 's', nodes: {}, isActive: true },
      { flowId: 'f2', instanceId: 'i1', name: 'F2', version: 1, start: 's', nodes: {}, isActive: true },
    ]
    const res = FlowsResponse.create(flows)
    expect(res.content).toHaveLength(2)
    expect(res.content[0].flowId).toBe('f1')
  })

  test('should return empty array for empty flows', () => {
    const res = FlowsResponse.create([])
    expect(res.content).toEqual([])
  })

  test('should return empty array via none()', () => {
    const res = FlowsResponse.none()
    expect(res.content).toEqual([])
  })
})
