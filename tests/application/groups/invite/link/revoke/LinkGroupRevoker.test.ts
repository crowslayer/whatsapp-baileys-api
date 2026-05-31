import { LinkGroupRevoker } from '../../../../../../src/application/groups/invite/link/revoke/LinkGroupRevoker'
import { InstanceId } from '../../../../../../src/domain/value-objects/InstanceId'
import { WhatsAppConnectionError } from '../../../../../../src/shared/infrastructure/errors/WhatsAppConnectionError'

describe('LinkGroupRevoker', () => {
  const instanceId = InstanceId.fromString('inst-1')

  test('execute revokes and returns new invite link', async () => {
    const mockInstance = { canSendMessages: () => true }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockAdapter = { groups: { revokeGroupInviteLink: vi.fn().mockResolvedValue('https://new.invite.link') } }
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) }
    const revoker = new LinkGroupRevoker(mockRepo, mockRuntime)

    const result = await revoker.execute(instanceId, 'group-123')

    expect(result).toBe('https://new.invite.link')
    expect(mockAdapter.groups.revokeGroupInviteLink).toHaveBeenCalledWith('group-123')
  })

  test('throws WhatsAppConnectionError when instance not found or not connected', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) }
    const mockRuntime = { get: vi.fn() }
    const revoker = new LinkGroupRevoker(mockRepo, mockRuntime)

    await expect(revoker.execute(instanceId, 'group-123')).rejects.toThrow(WhatsAppConnectionError)
  })

  test('throws WhatsAppConnectionError when adapter not found', async () => {
    const mockInstance = { canSendMessages: () => true }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockRuntime = { get: vi.fn().mockReturnValue(null) }
    const revoker = new LinkGroupRevoker(mockRepo, mockRuntime)

    await expect(revoker.execute(instanceId, 'group-123')).rejects.toThrow(WhatsAppConnectionError)
  })
})
