import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LinkGroupRevoker } from '@modules/groups/application/invite/link/revoke/LinkGroupRevoker';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import type { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

describe('LinkGroupRevoker', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('revokes an invite link through the connected runtime', async () => {
    // Arrange
    const id = InstanceId.fromString('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f');
    const repository = { findById: vi.fn().mockResolvedValue({ canSendMessages: () => true }) } as unknown as IInstanceRepository;
    const revokeGroupInviteLink = vi.fn().mockResolvedValue('new-link');
    const runtimeManager = { get: vi.fn().mockReturnValue({ groups: { revokeGroupInviteLink } }) } as unknown as IRuntimeManager;

    // Act
    const result = await new LinkGroupRevoker(repository, runtimeManager).execute(id, 'group@g.us');

    // Assert
    expect(result).toBe('new-link');
    expect(revokeGroupInviteLink).toHaveBeenCalledWith('group@g.us');
  });
});
