import { FlowResponse } from '../../../src/application/flows/FlowResponse'
import type { Flow } from '../../../src/domain/queries/IFlowReadRepository'

describe('FlowResponse', () => {
  test('should create with flow content', () => {
    const flow: Flow = {
      flowId: 'f1', instanceId: 'i1', name: 'Test', version: 1,
      start: 'start', nodes: {}, isActive: true,
    }
    const res = FlowResponse.create(flow)
    expect(res.content).toEqual(flow)
  })

  test('should create with null content', () => {
    const res = FlowResponse.create(null)
    expect(res.content).toBeNull()
  })
})
