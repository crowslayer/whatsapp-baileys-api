import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RevokeLinkCommandHandler } from '@modules/groups/application/invite/link/revoke/RevokeLinkCommandHandler';
import { RevokeLinkCommand } from '@modules/groups/application/invite/link/revoke/RevokeLinkCommand';
import type { LinkGroupRevoker } from '@modules/groups/application/invite/link/revoke/LinkGroupRevoker';

describe('RevokeLinkCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('converts the instance id and returns the replacement invite link', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue('replacement') } as unknown as LinkGroupRevoker;
    const handler = new RevokeLinkCommandHandler(useCase);
    const command = new RevokeLinkCommand('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', 'group@g.us');

    // Act
    const result = await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(RevokeLinkCommand);
    expect(useCase.execute).toHaveBeenCalledWith(expect.objectContaining({ value: command.instanceId }), command.groupId);
    expect(result).toBe('replacement');
  });
});
