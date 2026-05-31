import { AddParticipantGroupCommand } from '../../../../../src/application/groups/participants/add/AddParticipantGroupCommand';
import { ParticipantsAggregator } from '../../../../../src/application/groups/participants/add/ParticipantsAggregator';

describe('ParticipantsAggregator', () => {
  test('should throw when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) };
    const mockRuntime = { get: vi.fn() };
    const aggregator = new ParticipantsAggregator(mockRepo, mockRuntime);

    const command = new AddParticipantGroupCommand('inst-1', 'group-id', ['jid1']);
    await expect(aggregator.execute(command)).rejects.toThrow('not found');
  });

  test('should add participants successfully', async () => {
    const mockInstance = { instanceId: 'inst-1' };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockAdapter = {
      groups: { addParticipantsToGroup: vi.fn().mockResolvedValue(undefined) },
    };
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) };
    const aggregator = new ParticipantsAggregator(mockRepo, mockRuntime);

    const command = new AddParticipantGroupCommand('inst-1', 'group-id', ['jid1', 'jid2']);
    await aggregator.execute(command);
    expect(mockAdapter.groups.addParticipantsToGroup).toHaveBeenCalledWith('group-id', [
      'jid1',
      'jid2',
    ]);
  });
});
