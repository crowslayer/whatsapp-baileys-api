import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GroupInviteAccepted } from '@modules/groups/application/invite/accept/GroupInviteAccepted';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import type { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

describe('GroupInviteAccepted', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('accepts an invitation through the connected runtime', async () => {
    // Arrange
    const id = InstanceId.fromString('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f');
    const repository = { findById: vi.fn().mockResolvedValue({ canSendMessages: () => true }) } as unknown as IInstanceRepository;
    const acceptGroupInvite = vi.fn().mockResolvedValue('group@g.us');
    const runtimeManager = { get: vi.fn().mockReturnValue({ groups: { acceptGroupInvite } }) } as unknown as IRuntimeManager;

    // Act
    const result = await new GroupInviteAccepted(repository, runtimeManager).execute(id, 'invite-code');

    // Assert
    expect(result).toBe('group@g.us');
    expect(acceptGroupInvite).toHaveBeenCalledWith('invite-code');
  });
});
