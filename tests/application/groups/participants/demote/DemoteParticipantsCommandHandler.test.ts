import { describe, expect, vi } from 'vitest';
import { DemoteParticipantsCommand } from '../../../../../src/application/groups/participants/demote/DemoteParticipantsCommand';
import { DemoteParticipantsCommandHandler } from '../../../../../src/application/groups/participants/demote/DemoteParticipantsCommandHandler';

describe('DemoteParticipantsCommandHandler', () => {
  test('subscribedTo returns DemoteParticipantsCommand', () => {
    const handler = new DemoteParticipantsCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(DemoteParticipantsCommand);
  });

  test('handle calls demoter.execute with InstanceId, groupId and participants', async () => {
    const mockDemoter = { execute: vi.fn().mockResolvedValue(undefined) };
    const handler = new DemoteParticipantsCommandHandler(mockDemoter);

    const command = new DemoteParticipantsCommand('inst-1', 'group-123', ['jid1', 'jid2']);
    await handler.handle(command);

    expect(mockDemoter.execute).toHaveBeenCalledTimes(1);
    const [instanceId, groupId, participants] = mockDemoter.execute.mock.calls[0];
    expect(instanceId.value).toBe('inst-1');
    expect(groupId).toBe('group-123');
    expect(participants).toEqual(['jid1', 'jid2']);
  });
});
