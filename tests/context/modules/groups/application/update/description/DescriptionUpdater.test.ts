import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DescriptionUpdater } from '@modules/groups/application/update/description/DescriptionUpdater';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import type { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

const INSTANCE_ID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f';

describe('DescriptionUpdater', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('updates the group description through a connected runtime', async () => {
    // Arrange
    const repository = { findById: vi.fn().mockResolvedValue({ canSendMessages: () => true }) } as unknown as IInstanceRepository;
    const updateGroupDescription = vi.fn().mockResolvedValue(undefined);
    const runtimeManager = { get: vi.fn().mockReturnValue({ groups: { updateGroupDescription } }) } as unknown as IRuntimeManager;

    // Act
    await new DescriptionUpdater(repository, runtimeManager).execute(
      InstanceId.fromString(INSTANCE_ID), 'group@g.us', 'Description'
    );

    // Assert
    expect(updateGroupDescription).toHaveBeenCalledWith('group@g.us', 'Description');
  });
});
