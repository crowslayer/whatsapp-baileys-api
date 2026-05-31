import { ConnectInstanceCommandHandler } from '../../../../src/application/instances/connect/ConnectInstanceCommandHandler'
import { ConnectInstanceCommand } from '../../../../src/application/instances/connect/ConnectInstanceCommand'

describe('ConnectInstanceCommandHandler', () => {
  test('subscribedTo() returns ConnectInstanceCommand', () => {
    const handler = new ConnectInstanceCommandHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(ConnectInstanceCommand)
  })

  test('handle calls connector.execute', async () => {
    const mockConnector = { execute: vi.fn() }
    const handler = new ConnectInstanceCommandHandler(mockConnector)

    const command = new ConnectInstanceCommand('inst-1')
    await handler.handle(command)

    expect(mockConnector.execute).toHaveBeenCalledWith(command)
  })
})
