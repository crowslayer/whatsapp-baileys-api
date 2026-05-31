import { ReactionSender } from '../../../../src/application/messages/reaction/ReactionSender'
import { SendReactionCommand } from '../../../../src/application/messages/reaction/SendReactionCommand'
import { SendReactionCommandHandler } from '../../../../src/application/messages/reaction/SendReactionCommandHandler'

describe('SendReactionCommand', () => {
  test('should create command with all properties', () => {
    const messageId = { id: 'msg123', fromMe: true }
    const command = new SendReactionCommand('inst-1', messageId, '❤️', 'jid1@s.whatsapp.net')
    expect(command.instanceId).toBe('inst-1')
    expect(command.messageId).toEqual(messageId)
    expect(command.emoji).toBe('❤️')
    expect(command.chatId).toBe('jid1@s.whatsapp.net')
  })
})

describe('ReactionSender', () => {
  test('should send reaction successfully', async () => {
    const messageId = { id: 'msg123', fromMe: true }
    const mockInstance = { canSendMessages: () => true }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockAdapter = { messaging: { sendReaction: vi.fn() } }
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) }
    const sender = new ReactionSender(mockRepo, mockRuntime)
    const command = new SendReactionCommand('inst-1', messageId, '❤️', 'jid1@s.whatsapp.net')

    await sender.execute(command)

    expect(mockAdapter.messaging.sendReaction).toHaveBeenCalledWith('jid1@s.whatsapp.net', messageId, '❤️')
  })

  test('should throw when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) }
    const sender = new ReactionSender(mockRepo, { get: vi.fn() })
    const command = new SendReactionCommand('inst-1', { id: '1' }, '❤️', 'jid1')

    await expect(sender.execute(command)).rejects.toThrow('not found')
  })

  test('should throw when instance is not connected', async () => {
    const mockInstance = { canSendMessages: () => false }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const sender = new ReactionSender(mockRepo, { get: vi.fn() })
    const command = new SendReactionCommand('inst-1', { id: '1' }, '❤️', 'jid1')

    await expect(sender.execute(command)).rejects.toThrow('not connected')
  })

  test('should throw when adapter not found', async () => {
    const mockInstance = { canSendMessages: () => true }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockRuntime = { get: vi.fn().mockReturnValue(null) }
    const sender = new ReactionSender(mockRepo, mockRuntime)
    const command = new SendReactionCommand('inst-1', { id: '1' }, '❤️', 'jid1')

    await expect(sender.execute(command)).rejects.toThrow('adapter not found')
  })
})

describe('SendReactionCommandHandler', () => {
  test('subscribedTo returns SendReactionCommand', () => {
    const handler = new SendReactionCommandHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(SendReactionCommand)
  })

  test('handle delegates to reactionSender.execute', async () => {
    const mockSender = { execute: vi.fn() }
    const handler = new SendReactionCommandHandler(mockSender)
    const command = new SendReactionCommand('inst-1', { id: '1' }, '❤️', 'jid1')

    await handler.handle(command)

    expect(mockSender.execute).toHaveBeenCalledWith(command)
  })
})
