import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GroupCreator } from '@modules/groups/application/create/GroupCreator';
import { CreateGroupCommand } from '@modules/groups/application/create/CreateGroupCommand';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import type { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

const INSTANCE_ID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f';

describe('GroupCreator', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('creates a group for a connected instance', async () => {
    // Arrange
    const instance = { canSendMessages: () => true };
    const repository = { findById: vi.fn().mockResolvedValue(instance) } as unknown as IInstanceRepository;
    const createGroup = vi.fn().mockResolvedValue('group@g.us');
    const runtimeManager = { get: vi.fn().mockReturnValue({ groups: { createGroup } }) } as unknown as IRuntimeManager;
    const command = new CreateGroupCommand(INSTANCE_ID, 'Team', ['123@s.whatsapp.net']);

    // Act
    const result = await new GroupCreator(repository, runtimeManager).execute(command);

    // Assert
    expect(result).toBe('group@g.us');
    expect(createGroup).toHaveBeenCalledWith('Team', ['123@s.whatsapp.net']);
  });

  it('rejects when the instance does not exist', async () => {
    // Arrange
    const repository = { findById: vi.fn().mockResolvedValue(null) } as unknown as IInstanceRepository;
    const runtimeManager = { get: vi.fn() } as unknown as IRuntimeManager;

    // Act / Assert
    await expect(new GroupCreator(repository, runtimeManager).execute(
      new CreateGroupCommand(INSTANCE_ID, 'Team', [])
    )).rejects.toThrow('Instance');
  });
});
