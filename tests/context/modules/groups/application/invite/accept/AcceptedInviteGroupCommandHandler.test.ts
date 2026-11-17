import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AcceptedInviteGroupCommandHandler } from '@modules/groups/application/invite/accept/AcceptedInviteGroupCommandHandler';
import { AcceptedInviteGroupCommand } from '@modules/groups/application/invite/accept/AcceptedInviteGroupCommand';
import type { GroupInviteAccepted } from '@modules/groups/application/invite/accept/GroupInviteAccepted';

describe('AcceptedInviteGroupCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('converts the instance id and delegates invite acceptance', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue('group@g.us') } as unknown as GroupInviteAccepted;
    const handler = new AcceptedInviteGroupCommandHandler(useCase);
    const command = new AcceptedInviteGroupCommand('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', 'code');

    // Act
    const result = await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(AcceptedInviteGroupCommand);
    expect(useCase.execute).toHaveBeenCalledWith(expect.objectContaining({ value: command.instanceId }), 'code');
    expect(result).toBe('group@g.us');
  });
});
