import { InstancesEraser } from '../../../src/application/instances/delete/InstancesEraser'
import { DeleteInstanceCommand } from '../../../src/application/instances/delete/DeleteInstanceCommand'

describe('InstancesEraser', () => {
  test('execute calls repository.delete and runtimeManager.stop', async () => {
    const mockRepo = { delete: vi.fn(), findByName: vi.fn(), save: vi.fn(), findById: vi.fn(), update: vi.fn(), findAll: vi.fn() }
    const mockRuntime = { stop: vi.fn(), start: vi.fn() }
    const eraser = new InstancesEraser(mockRepo, mockRuntime)

    const command = new DeleteInstanceCommand('inst-1')
    await eraser.execute(command)

    expect(mockRepo.delete).toHaveBeenCalledWith('inst-1')
    expect(mockRuntime.stop).toHaveBeenCalledWith('inst-1')
  })
})
