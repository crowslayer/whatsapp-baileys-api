import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GetInvitedLinkCommandHandler } from '@modules/groups/application/invite/link/get/GetInvitedLinkCommandHandler';
import { GetInvitedLinkCommand } from '@modules/groups/application/invite/link/get/GetInvitedLinkCommand';
import type { LinkGroupGetter } from '@modules/groups/application/invite/link/get/LinkGroupGetter';

describe('GetInvitedLinkCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('converts the instance id and returns the group link', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue('https://example.test/invite') } as unknown as LinkGroupGetter;
    const handler = new GetInvitedLinkCommandHandler(useCase);
    const command = new GetInvitedLinkCommand('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', 'group@g.us');

    // Act
    const result = await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(GetInvitedLinkCommand);
    expect(useCase.execute).toHaveBeenCalledWith(expect.objectContaining({ value: command.instanceId }), command.groupId);
    expect(result).toBe('https://example.test/invite');
  });
});
