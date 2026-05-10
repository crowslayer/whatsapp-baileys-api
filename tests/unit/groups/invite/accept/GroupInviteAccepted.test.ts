import { GroupInviteAccepted } from '../../../../../src/application/groups/invite/accept/GroupInviteAccepted'
import { InstanceId } from '../../../../../src/domain/value-objects/InstanceId'
import { WhatsAppConnectionError } from '../../../../../src/shared/infrastructure/errors/WhatsAppConnectionError'

describe('GroupInviteAccepted', () => {
  const instanceId = InstanceId.fromString('inst-1')

  test('execute accepts invite and returns group id', async () => {
    const mockInstance = { canSendMessages: () => true }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockAdapter = { groups: { acceptGroupInvite: vi.fn().mockResolvedValue('group-id-123') } }
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) }
    const accepter = new GroupInviteAccepted(mockRepo, mockRuntime)

    const result = await accepter.execute(instanceId, 'invite-code')

    expect(result).toBe('group-id-123')
    expect(mockAdapter.groups.acceptGroupInvite).toHaveBeenCalledWith('invite-code')
  })

  test('throws WhatsAppConnectionError when instance not found or not connected', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) }
    const mockRuntime = { get: vi.fn() }
    const accepter = new GroupInviteAccepted(mockRepo, mockRuntime)

    await expect(accepter.execute(instanceId, 'invite-code')).rejects.toThrow(WhatsAppConnectionError)
  })

  test('throws WhatsAppConnectionError when adapter not found', async () => {
    const mockInstance = { canSendMessages: () => true }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockRuntime = { get: vi.fn().mockReturnValue(null) }
    const accepter = new GroupInviteAccepted(mockRepo, mockRuntime)

    await expect(accepter.execute(instanceId, 'invite-code')).rejects.toThrow(WhatsAppConnectionError)
  })
})
