import { LocationSender } from '../../../../src/application/messages/location/LocationSender'
import { SendLocationCommand } from '../../../../src/application/messages/location/SendLocationCommand'
import { SendLocationCommandHandler } from '../../../../src/application/messages/location/SendLocationCommandHandler'

describe('SendLocationCommand', () => {
  test('should create command with all properties', () => {
    const command = new SendLocationCommand('inst-1', 'jid1', 40.4168, -3.7038, 'Madrid', 'Spain')
    expect(command.instanceId).toBe('inst-1')
    expect(command.to).toBe('jid1')
    expect(command.latitude).toBe(40.4168)
    expect(command.longitude).toBe(-3.7038)
    expect(command.name).toBe('Madrid')
    expect(command.address).toBe('Spain')
  })

  test('should create command with defaults', () => {
    const command = new SendLocationCommand('inst-1', 'jid1', 40.4168, -3.7038)
    expect(command.name).toBeUndefined()
    expect(command.address).toBeUndefined()
  })
})

describe('LocationSender', () => {
  test('should send location successfully', async () => {
    const mockInstance = { canSendMessages: () => true }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockAdapter = { messaging: { sendLocation: vi.fn() } }
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) }
    const sender = new LocationSender(mockRepo, mockRuntime)
    const command = new SendLocationCommand('inst-1', 'jid1', 40.4168, -3.7038, 'Madrid', 'Spain')

    await sender.execute(command)

    expect(mockAdapter.messaging.sendLocation).toHaveBeenCalledWith('jid1', 40.4168, -3.7038, 'Madrid', 'Spain')
  })

  test('should throw when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) }
    const sender = new LocationSender(mockRepo, { get: vi.fn() })
    const command = new SendLocationCommand('inst-1', 'jid1', 0, 0)

    await expect(sender.execute(command)).rejects.toThrow('not found')
  })

  test('should throw when instance is not connected', async () => {
    const mockInstance = { canSendMessages: () => false }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const sender = new LocationSender(mockRepo, { get: vi.fn() })
    const command = new SendLocationCommand('inst-1', 'jid1', 0, 0)

    await expect(sender.execute(command)).rejects.toThrow('not connected')
  })

  test('should throw when adapter not found', async () => {
    const mockInstance = { canSendMessages: () => true }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockRuntime = { get: vi.fn().mockReturnValue(null) }
    const sender = new LocationSender(mockRepo, mockRuntime)
    const command = new SendLocationCommand('inst-1', 'jid1', 0, 0)

    await expect(sender.execute(command)).rejects.toThrow('adapter not found')
  })
})

describe('SendLocationCommandHandler', () => {
  test('subscribedTo returns SendLocationCommand', () => {
    const handler = new SendLocationCommandHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(SendLocationCommand)
  })

  test('handle delegates to locationSender.execute', async () => {
    const mockSender = { execute: vi.fn() }
    const handler = new SendLocationCommandHandler(mockSender)
    const command = new SendLocationCommand('inst-1', 'jid1', 40.4168, -3.7038)

    await handler.handle(command)

    expect(mockSender.execute).toHaveBeenCalledWith(command)
  })
})
