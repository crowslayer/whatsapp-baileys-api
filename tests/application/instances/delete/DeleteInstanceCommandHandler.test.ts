import { DeleteInstanceCommandHandler } from '../../../../src/application/instances/delete/DeleteInstanceCommandHandler'
import { DeleteInstanceCommand } from '../../../../src/application/instances/delete/DeleteInstanceCommand'

describe('DeleteInstanceCommandHandler', () => {
  test('subscribedTo() returns DeleteInstanceCommand', () => {
    const handler = new DeleteInstanceCommandHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(DeleteInstanceCommand)
  })

  test('handle calls eraser.execute', async () => {
    const mockEraser = { execute: vi.fn() }
    const handler = new DeleteInstanceCommandHandler(mockEraser)

    const command = new DeleteInstanceCommand('inst-1')
    await handler.handle(command)

    expect(mockEraser.execute).toHaveBeenCalledWith(command)
  })
})
