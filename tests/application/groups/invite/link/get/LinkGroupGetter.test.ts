import { LinkGroupGetter } from '../../../../../../src/application/groups/invite/link/get/LinkGroupGetter'
import { InstanceId } from '../../../../../../src/domain/value-objects/InstanceId'
import { WhatsAppConnectionError } from '../../../../../../src/shared/infrastructure/errors/WhatsAppConnectionError'

describe('LinkGroupGetter', () => {
  const instanceId = InstanceId.fromString('inst-1')

  test('execute returns invite link', async () => {
    const mockInstance = { canSendMessages: () => true }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockAdapter = { groups: { getGroupInviteLink: vi.fn().mockResolvedValue('https://invite.link') } }
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) }
    const getter = new LinkGroupGetter(mockRepo, mockRuntime)

    const result = await getter.execute(instanceId, 'group-123')

    expect(result).toBe('https://invite.link')
    expect(mockAdapter.groups.getGroupInviteLink).toHaveBeenCalledWith('group-123')
  })

  test('throws WhatsAppConnectionError when instance not found or not connected', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) }
    const mockRuntime = { get: vi.fn() }
    const getter = new LinkGroupGetter(mockRepo, mockRuntime)

    await expect(getter.execute(instanceId, 'group-123')).rejects.toThrow(WhatsAppConnectionError)
  })

  test('throws WhatsAppConnectionError when adapter not found', async () => {
    const mockInstance = { canSendMessages: () => true }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockRuntime = { get: vi.fn().mockReturnValue(null) }
    const getter = new LinkGroupGetter(mockRepo, mockRuntime)

    await expect(getter.execute(instanceId, 'group-123')).rejects.toThrow(WhatsAppConnectionError)
  })
})
