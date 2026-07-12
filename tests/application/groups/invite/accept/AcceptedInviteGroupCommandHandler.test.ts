import { describe, expect, vi } from 'vitest';
import { AcceptedInviteGroupCommand } from '../../../../../src/application/groups/invite/accept/AcceptedInviteGroupCommand';
import { AcceptedInviteGroupCommandHandler } from '../../../../../src/application/groups/invite/accept/AcceptedInviteGroupCommandHandler';

describe('AcceptedInviteGroupCommandHandler', () => {
  test('subscribedTo returns AcceptedInviteGroupCommand', () => {
    const handler = new AcceptedInviteGroupCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(AcceptedInviteGroupCommand);
  });

  test('handle calls accepter.execute with InstanceId and code', async () => {
    const mockAccepter = { execute: vi.fn().mockResolvedValue('group-id-123') };
    const handler = new AcceptedInviteGroupCommandHandler(mockAccepter);

    const command = new AcceptedInviteGroupCommand('inst-1', 'invite-code');
    const result = await handler.handle(command);

    expect(result).toBe('group-id-123');
    expect(mockAccepter.execute).toHaveBeenCalledTimes(1);
    const [instanceId, code] = mockAccepter.execute.mock.calls[0];
    expect(instanceId.value).toBe('inst-1');
    expect(code).toBe('invite-code');
  });
});
