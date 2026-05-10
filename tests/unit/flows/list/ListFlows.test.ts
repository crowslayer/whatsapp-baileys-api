import { ListFlows } from '../../../../src/application/flows/list/ListFlows'
import type { Flow } from '../../../../src/domain/queries/IFlowReadRepository'

describe('ListFlows', () => {
  test('should return flows from repository', async () => {
    const mockFlows: Flow[] = [
      { flowId: 'f1', instanceId: 'i1', name: 'F1', version: 1, start: 's', nodes: {}, isActive: true },
    ]
    const mockRepo = { findByInstance: vi.fn().mockResolvedValue(mockFlows), findActiveByInstance: vi.fn(), findById: vi.fn() }
    const finder = new ListFlows(mockRepo)

    const result = await finder.execute('i1')
    expect(result).toEqual(mockFlows)
    expect(mockRepo.findByInstance).toHaveBeenCalledWith('i1')
  })

  test('should return empty array when no flows', async () => {
    const mockRepo = { findByInstance: vi.fn().mockResolvedValue([]), findActiveByInstance: vi.fn(), findById: vi.fn() }
    const finder = new ListFlows(mockRepo)

    const result = await finder.execute('i1')
    expect(result).toEqual([])
  })
})
