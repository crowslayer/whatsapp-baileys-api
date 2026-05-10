import { GroupCreator } from '../../../src/application/groups/create/GroupCreator'
import { CreateGroupCommand } from '../../../src/application/groups/create/CreateGroupCommand'

describe('GroupCreator', () => {
  test('should throw when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) }
    const mockRuntime = { get: vi.fn() }
    const creator = new GroupCreator(mockRepo, mockRuntime)

    const command = new CreateGroupCommand('inst-1', 'Group Name', ['jid1'])
    await expect(creator.execute(command)).rejects.toThrow('not found')
  })

  test('should throw when instance cannot send messages', async () => {
    const mockInstance = { canSendMessages: () => false }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockRuntime = { get: vi.fn() }
    const creator = new GroupCreator(mockRepo, mockRuntime)

    const command = new CreateGroupCommand('inst-1', 'Group Name', ['jid1'])
    await expect(creator.execute(command)).rejects.toThrow('not connected')
  })

  test('should throw when adapter not found', async () => {
    const mockInstance = { canSendMessages: () => true }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockRuntime = { get: vi.fn().mockReturnValue(null) }
    const creator = new GroupCreator(mockRepo, mockRuntime)

    const command = new CreateGroupCommand('inst-1', 'Group Name', ['jid1'])
    await expect(creator.execute(command)).rejects.toThrow('adapter not found')
  })

  test('should create group successfully', async () => {
    const mockInstance = { instanceId: 'inst-1', canSendMessages: () => true }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockAdapter = { groups: { createGroup: vi.fn().mockResolvedValue('group-id-123') } }
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) }
    const creator = new GroupCreator(mockRepo, mockRuntime)

    const command = new CreateGroupCommand('inst-1', 'My Group', ['jid1', 'jid2'])
    const result = await creator.execute(command)
    expect(result).toBe('group-id-123')
    expect(mockAdapter.groups.createGroup).toHaveBeenCalledWith('My Group', ['jid1', 'jid2'])
  })
})
