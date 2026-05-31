import { FlowCreator } from '../../../../src/application/flows/create/FlowCreator'
import { InstanceId } from '../../../../src/domain/value-objects/InstanceId'
import { Name } from '../../../../src/domain/value-objects/Name'

describe('FlowCreator', () => {
  test('should create flow successfully', async () => {
    const mockRepo = { save: vi.fn(), findById: vi.fn(), delete: vi.fn() }
    const creator = new FlowCreator(mockRepo)
    const instanceId = InstanceId.fromString('inst-1')
    const name = Name.create('Test Flow')

    await creator.execute(instanceId, name)
    expect(mockRepo.save).toHaveBeenCalledTimes(1)
  })
})
