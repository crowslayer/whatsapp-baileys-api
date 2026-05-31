import { CreateFlowCommandHandler } from '../../../../src/application/flows/create/CreateFlowCommandHandler'
import { CreateFlowCommand } from '../../../../src/application/flows/create/CreateFlowCommand'
import { InstanceId } from '../../../../src/domain/value-objects/InstanceId'
import { Name } from '../../../../src/domain/value-objects/Name'

describe('CreateFlowCommandHandler', () => {
  test('should call creator.execute with command params', async () => {
    const mockCreator = { execute: vi.fn() }
    const handler = new CreateFlowCommandHandler(mockCreator)
    const instanceId = InstanceId.fromString('inst-1')
    const name = Name.create('Test')
    const command = new CreateFlowCommand(instanceId, name)

    await handler.handle(command)
    expect(mockCreator.execute).toHaveBeenCalledWith(instanceId, name)
  })

  test('subscribedTo returns CreateFlowCommand', () => {
    const handler = new CreateFlowCommandHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(CreateFlowCommand)
  })
})
