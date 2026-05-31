import { ListFlowsQueryHandler } from '../../../../src/application/flows/list/ListFlowsQueryHandler'
import { ListFlowsQuery } from '../../../../src/application/flows/list/ListFlowsQuery'
import { FlowsResponse } from '../../../../src/application/flows/FlowsResponse'
import type { Flow } from '../../../../src/domain/queries/IFlowReadRepository'

describe('ListFlowsQueryHandler', () => {
  test('should return FlowsResponse', async () => {
    const mockFlows: Flow[] = [
      { flowId: 'f1', instanceId: 'i1', name: 'F1', version: 1, start: 's', nodes: {}, isActive: true },
    ]
    const mockFinder = { execute: vi.fn().mockResolvedValue(mockFlows) }
    const handler = new ListFlowsQueryHandler(mockFinder)
    const query = new ListFlowsQuery('i1')

    const result = await handler.handle(query)
    expect(result).toBeInstanceOf(FlowsResponse)
    expect(result.content).toHaveLength(1)
    expect(mockFinder.execute).toHaveBeenCalledWith('i1')
  })

  test('subscribedTo returns ListFlowsQuery', () => {
    const handler = new ListFlowsQueryHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(ListFlowsQuery)
  })
})
