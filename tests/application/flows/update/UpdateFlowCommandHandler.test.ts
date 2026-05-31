import { UpdateFlowCommandHandler } from '../../../../src/application/flows/update/UpdateFlowCommandHandler'
import { UpdateFlowCommand } from '../../../../src/application/flows/update/UpdateFlowCommand'
import { FlowId } from '../../../../src/domain/value-objects/FlowId'
import { InstanceId } from '../../../../src/domain/value-objects/InstanceId'
import { Name } from '../../../../src/domain/value-objects/Name'

describe('UpdateFlowCommandHandler', () => {
  test('should call updater.execute with command params', async () => {
    const mockUpdater = { execute: vi.fn() }
    const handler = new UpdateFlowCommandHandler(mockUpdater)
    const flowId = FlowId.fromString('flow-1')
    const instanceId = InstanceId.fromString('inst-1')
    const name = Name.create('Updated')
    const command = new UpdateFlowCommand(flowId, instanceId, name)

    await handler.handle(command)

    expect(mockUpdater.execute).toHaveBeenCalledWith(flowId, instanceId, name)
  })

  test('subscribedTo returns UpdateFlowCommand', () => {
    const handler = new UpdateFlowCommandHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(UpdateFlowCommand)
  })
})
