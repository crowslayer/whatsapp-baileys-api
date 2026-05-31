import { ParticipantPromoter } from '../../../../../src/application/groups/participants/promote/ParticipantPromoter'
import { InstanceId } from '../../../../../src/domain/value-objects/InstanceId'
import { WhatsAppConnectionError } from '../../../../../src/shared/infrastructure/errors/WhatsAppConnectionError'

describe('ParticipantPromoter', () => {
  const instanceId = InstanceId.fromString('inst-1')

  test('execute promotes participants successfully', async () => {
    const mockInstance = { instanceId: 'inst-1', canSendMessages: () => false }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockAdapter = { groups: { promoteParticipants: vi.fn().mockResolvedValue(undefined) } }
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) }
    const promoter = new ParticipantPromoter(mockRepo, mockRuntime)

    await promoter.execute(instanceId, 'group-123', ['jid1', 'jid2'])

    expect(mockAdapter.groups.promoteParticipants).toHaveBeenCalledWith('group-123', ['jid1', 'jid2'])
  })

  test('throws WhatsAppConnectionError when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) }
    const mockRuntime = { get: vi.fn() }
    const promoter = new ParticipantPromoter(mockRepo, mockRuntime)

    await expect(promoter.execute(instanceId, 'group-123', ['jid1'])).rejects.toThrow(WhatsAppConnectionError)
  })

  test('throws WhatsAppConnectionError when instance.canSendMessages() is true (current buggy behavior)', async () => {
    const mockInstance = { canSendMessages: () => true }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockRuntime = { get: vi.fn() }
    const promoter = new ParticipantPromoter(mockRepo, mockRuntime)

    await expect(promoter.execute(instanceId, 'group-123', ['jid1'])).rejects.toThrow(WhatsAppConnectionError)
  })

  test('throws WhatsAppConnectionError when adapter not found', async () => {
    const mockInstance = { instanceId: 'inst-1', canSendMessages: () => false }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockRuntime = { get: vi.fn().mockReturnValue(null) }
    const promoter = new ParticipantPromoter(mockRepo, mockRuntime)

    await expect(promoter.execute(instanceId, 'group-123', ['jid1'])).rejects.toThrow(WhatsAppConnectionError)
  })
})
