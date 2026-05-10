import { NodesCreator } from '../../../../../src/application/flows/nodes/create/NodesCreator'
import { FlowId } from '../../../../../src/domain/value-objects/FlowId'

describe('NodesCreator', () => {
  test('should update nodes, add triggers, and save', async () => {
    const mockAggregate = { updateNodes: vi.fn(), addTriggers: vi.fn() }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockAggregate), save: vi.fn() }
    const creator = new NodesCreator(mockRepo)
    const flowId = FlowId.fromString('flow-1')
    const nodes = {}
    const start = 'start'
    const triggers = []

    await creator.execute(flowId, nodes, start, triggers)

    expect(mockRepo.findById).toHaveBeenCalledWith(flowId)
    expect(mockAggregate.updateNodes).toHaveBeenCalledWith(nodes, start)
    expect(mockAggregate.addTriggers).toHaveBeenCalledWith(triggers)
    expect(mockRepo.save).toHaveBeenCalledWith(mockAggregate)
  })

  test('should wrap repository error with message', async () => {
    const mockRepo = { findById: vi.fn().mockRejectedValue(new Error('db fail')), save: vi.fn() }
    const creator = new NodesCreator(mockRepo)
    const flowId = FlowId.fromString('flow-1')

    await expect(creator.execute(flowId, {}, 'start', [])).rejects.toThrow('Error creating nodes')
  })

  test('should rethrow non-Error throws', async () => {
    const mockRepo = { findById: vi.fn().mockRejectedValue('string error'), save: vi.fn() }
    const creator = new NodesCreator(mockRepo)
    const flowId = FlowId.fromString('flow-1')

    await expect(creator.execute(flowId, {}, 'start', [])).rejects.toBe('string error')
  })
})
