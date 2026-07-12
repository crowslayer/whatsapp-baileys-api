import { describe, expect, vi } from 'vitest';
import { GetInvitedLinkCommand } from '../../../../../../src/application/groups/invite/link/get/GetInvitedLinkCommand';
import { GetInvitedLinkCommandHandler } from '../../../../../../src/application/groups/invite/link/get/GetInvitedLinkCommandHandler';

describe('GetInvitedLinkCommandHandler', () => {
  test('subscribedTo returns GetInvitedLinkCommand', () => {
    const handler = new GetInvitedLinkCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(GetInvitedLinkCommand);
  });

  test('handle calls linkGetter.execute with InstanceId and groupId', async () => {
    const mockGetter = { execute: vi.fn().mockResolvedValue('https://invite.link') };
    const handler = new GetInvitedLinkCommandHandler(mockGetter);

    const command = new GetInvitedLinkCommand('inst-1', 'group-123');
    const result = await handler.handle(command);

    expect(result).toBe('https://invite.link');
    expect(mockGetter.execute).toHaveBeenCalledTimes(1);
    const [instanceId, groupId] = mockGetter.execute.mock.calls[0];
    expect(instanceId.value).toBe('inst-1');
    expect(groupId).toBe('group-123');
  });
});
