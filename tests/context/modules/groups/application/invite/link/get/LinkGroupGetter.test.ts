import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LinkGroupGetter } from '@modules/groups/application/invite/link/get/LinkGroupGetter';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import type { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

describe('LinkGroupGetter', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns the invite link from the connected runtime', async () => {
    // Arrange
    const id = InstanceId.fromString('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f');
    const repository = { findById: vi.fn().mockResolvedValue({ canSendMessages: () => true }) } as unknown as IInstanceRepository;
    const getGroupInviteLink = vi.fn().mockResolvedValue('https://chat.whatsapp.com/code');
    const runtimeManager = { get: vi.fn().mockReturnValue({ groups: { getGroupInviteLink } }) } as unknown as IRuntimeManager;

    // Act
    const result = await new LinkGroupGetter(repository, runtimeManager).execute(id, 'group@g.us');

    // Assert
    expect(result).toBe('https://chat.whatsapp.com/code');
    expect(getGroupInviteLink).toHaveBeenCalledWith('group@g.us');
  });
});
