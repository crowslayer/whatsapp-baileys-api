import { NodesEraser } from '../../../../../src/application/flows/nodes/delete/NodesEraser'
import { FlowId } from '../../../../../src/domain/value-objects/FlowId'

describe('NodesEraser', () => {
  test('should reset nodes and save', async () => {
    const mockAggregate = { resetNodes: vi.fn() }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockAggregate), save: vi.fn() }
    const eraser = new NodesEraser(mockRepo)
    const flowId = FlowId.fromString('flow-1')

    await eraser.execute(flowId)

    expect(mockRepo.findById).toHaveBeenCalledWith(flowId)
    expect(mockAggregate.resetNodes).toHaveBeenCalledTimes(1)
    expect(mockRepo.save).toHaveBeenCalledWith(mockAggregate)
  })
})
