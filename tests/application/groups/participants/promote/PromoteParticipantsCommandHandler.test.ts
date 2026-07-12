import { describe, expect, vi } from 'vitest';
import { PromoteParticipantsCommand } from '../../../../../src/application/groups/participants/promote/PromoteParticipantsCommand';
import { PromoteParticipantsCommandHandler } from '../../../../../src/application/groups/participants/promote/PromoteParticipantsCommandHandler';

describe('PromoteParticipantsCommandHandler', () => {
  test('subscribedTo returns PromoteParticipantsCommand', () => {
    const handler = new PromoteParticipantsCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(PromoteParticipantsCommand);
  });

  test('handle calls promoter.execute with InstanceId, groupId and participants', async () => {
    const mockPromoter = { execute: vi.fn().mockResolvedValue(undefined) };
    const handler = new PromoteParticipantsCommandHandler(mockPromoter);

    const command = new PromoteParticipantsCommand('inst-1', 'group-123', ['jid1', 'jid2']);
    await handler.handle(command);

    expect(mockPromoter.execute).toHaveBeenCalledTimes(1);
    const [instanceId, groupId, participants] = mockPromoter.execute.mock.calls[0];
    expect(instanceId.value).toBe('inst-1');
    expect(groupId).toBe('group-123');
    expect(participants).toEqual(['jid1', 'jid2']);
  });
});
