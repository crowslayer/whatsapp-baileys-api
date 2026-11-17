import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GroupLeaver } from '@modules/groups/application/leave/GroupLeaver';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import type { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

describe('GroupLeaver', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('leaves a group using the connected runtime', async () => {
    // Arrange
    const id = InstanceId.fromString('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f');
    const repository = { findById: vi.fn().mockResolvedValue({ canSendMessages: () => true }) } as unknown as IInstanceRepository;
    const leaveGroup = vi.fn().mockResolvedValue(undefined);
    const runtimeManager = { get: vi.fn().mockReturnValue({ groups: { leaveGroup } }) } as unknown as IRuntimeManager;

    // Act
    await new GroupLeaver(repository, runtimeManager).execute(id, 'group@g.us');

    // Assert
    expect(leaveGroup).toHaveBeenCalledWith('group@g.us');
  });

  it('rejects when the instance is disconnected', async () => {
    // Arrange
    const id = InstanceId.fromString('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f');
    const repository = { findById: vi.fn().mockResolvedValue({ canSendMessages: () => false }) } as unknown as IInstanceRepository;
    const runtimeManager = { get: vi.fn() } as unknown as IRuntimeManager;

    // Act / Assert
    await expect(new GroupLeaver(repository, runtimeManager).execute(id, 'group@g.us'))
      .rejects.toThrow('not found or not connected');
  });
});
