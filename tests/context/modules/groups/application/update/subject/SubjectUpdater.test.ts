import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SubjetUpdater } from '@modules/groups/application/update/subject/SubjectUpdater';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import type { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

const INSTANCE_ID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f';

describe('SubjetUpdater', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('updates the group subject through a connected runtime', async () => {
    // Arrange
    const repository = { findById: vi.fn().mockResolvedValue({ canSendMessages: () => true }) } as unknown as IInstanceRepository;
    const updateGroupSubject = vi.fn().mockResolvedValue(undefined);
    const runtimeManager = { get: vi.fn().mockReturnValue({ groups: { updateGroupSubject } }) } as unknown as IRuntimeManager;

    // Act
    await new SubjetUpdater(repository, runtimeManager).execute(
      InstanceId.fromString(INSTANCE_ID), 'group@g.us', 'New subject'
    );

    // Assert
    expect(updateGroupSubject).toHaveBeenCalledWith('group@g.us', 'New subject');
  });
});
