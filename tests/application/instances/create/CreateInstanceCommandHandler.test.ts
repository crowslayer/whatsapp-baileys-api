import { CreateInstanceCommandHandler } from '../../../../src/application/instances/create/CreateInstanceCommandHandler'
import { CreateInstanceCommand } from '../../../../src/application/instances/create/CreateInstanceCommand'

describe('CreateInstanceCommandHandler', () => {
  test('subscribedTo() returns CreateInstanceCommand', () => {
    const handler = new CreateInstanceCommandHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(CreateInstanceCommand)
  })

  test('handle calls creator.execute and wraps result in AggregateResponse', async () => {
    const result = { toJSON: () => ({ instanceId: 'inst-1', name: 'Test', status: 'pending' }) }
    const mockCreator = { execute: vi.fn().mockResolvedValue(result) }
    const handler = new CreateInstanceCommandHandler(mockCreator)

    const command = new CreateInstanceCommand('Test', 'http://hook.test')
    const response = await handler.handle(command)

    expect(mockCreator.execute).toHaveBeenCalledWith(command)
    expect(response.content.instanceId).toBe('inst-1')
  })
})
