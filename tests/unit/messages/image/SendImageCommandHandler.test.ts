import { SendImageCommandHandler } from '../../../../src/application/messages/image/SendImageCommandHandler'
import { SendImageCommand } from '../../../../src/application/messages/image/SendImageCommand'

describe('SendImageCommandHandler', () => {
  test('subscribedTo returns SendImageCommand', () => {
    const handler = new SendImageCommandHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(SendImageCommand)
  })

  test('handle delegates to sender.execute', async () => {
    const mockSender = { execute: vi.fn() }
    const handler = new SendImageCommandHandler(mockSender)
    const command = new SendImageCommand('inst-1', 'jid1', Buffer.from('image-data'), 'Caption')

    await handler.handle(command)

    expect(mockSender.execute).toHaveBeenCalledWith(command)
  })
})
