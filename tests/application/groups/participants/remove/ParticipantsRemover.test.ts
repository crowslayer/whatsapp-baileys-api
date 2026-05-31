import { ParticipantsRemover } from '../../../../../src/application/groups/participants/remove/ParticipantsRemover'
import { RemoveParticipantsGroupCommand } from '../../../../../src/application/groups/participants/remove/RemoveParticipantsGroupCommand'
import { NotFoundError } from '../../../../../src/shared/infrastructure/errors/NotFoundError'

describe('ParticipantsRemover', () => {
  test('execute removes participants', async () => {
    const mockInstance = { canSendMessages: () => true }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockAdapter = { groups: { removeParticipantsFromGroup: vi.fn().mockResolvedValue(undefined) } }
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) }
    const remover = new ParticipantsRemover(mockRepo, mockRuntime)

    const command = new RemoveParticipantsGroupCommand('inst-1', 'group-123', ['jid1', 'jid2'])
    await remover.execute(command)

    expect(mockAdapter.groups.removeParticipantsFromGroup).toHaveBeenCalledWith('group-123', ['jid1', 'jid2'])
  })

  test('throws NotFoundError when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) }
    const mockRuntime = { get: vi.fn() }
    const remover = new ParticipantsRemover(mockRepo, mockRuntime)

    const command = new RemoveParticipantsGroupCommand('inst-1', 'group-123', ['jid1'])
    await expect(remover.execute(command)).rejects.toThrow(NotFoundError)
  })

  test('throws NotFoundError when adapter not found', async () => {
    const mockInstance = { canSendMessages: () => true }
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) }
    const mockRuntime = { get: vi.fn().mockReturnValue(null) }
    const remover = new ParticipantsRemover(mockRepo, mockRuntime)

    const command = new RemoveParticipantsGroupCommand('inst-1', 'group-123', ['jid1'])
    await expect(remover.execute(command)).rejects.toThrow(NotFoundError)
  })
})
