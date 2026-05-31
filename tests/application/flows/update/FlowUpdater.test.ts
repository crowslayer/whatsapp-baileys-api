import { FlowUpdater } from '../../../../src/application/flows/update/FlowUpdater'
import { FlowId } from '../../../../src/domain/value-objects/FlowId'
import { InstanceId } from '../../../../src/domain/value-objects/InstanceId'
import { Name } from '../../../../src/domain/value-objects/Name'

describe('FlowUpdater', () => {
  test('should update flow and save', async () => {
    const mockAggregate = { changeInstance: vi.fn(), rename: vi.fn() }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockAggregate), save: vi.fn() }
    const updater = new FlowUpdater(mockRepo)
    const flowId = FlowId.fromString('flow-1')
    const instanceId = InstanceId.fromString('inst-1')
    const name = Name.create('Updated Flow')

    await updater.execute(flowId, instanceId, name)

    expect(mockRepo.findById).toHaveBeenCalledWith(flowId)
    expect(mockAggregate.changeInstance).toHaveBeenCalledWith(instanceId)
    expect(mockAggregate.rename).toHaveBeenCalledWith(name)
    expect(mockRepo.save).toHaveBeenCalledWith(mockAggregate)
  })

  test('should throw when repository fails', async () => {
    const mockRepo = { findById: vi.fn().mockRejectedValue(new Error('db error')), save: vi.fn() }
    const updater = new FlowUpdater(mockRepo)
    const flowId = FlowId.fromString('flow-1')
    const instanceId = InstanceId.fromString('inst-1')
    const name = Name.create('Updated Flow')

    await expect(updater.execute(flowId, instanceId, name)).rejects.toThrow('db error')
  })
})
