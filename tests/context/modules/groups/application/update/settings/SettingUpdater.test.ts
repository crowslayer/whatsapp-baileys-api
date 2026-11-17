import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingUpdater } from '@modules/groups/application/update/settings/SettingUpdater';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import type { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

const INSTANCE_ID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f';

describe('SettingUpdater', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('applies a supported group setting', async () => {
    // Arrange
    const repository = { findById: vi.fn().mockResolvedValue({ canSendMessages: () => true }) } as unknown as IInstanceRepository;
    const updateGroupSettings = vi.fn().mockResolvedValue(undefined);
    const runtimeManager = { get: vi.fn().mockReturnValue({ groups: { updateGroupSettings } }) } as unknown as IRuntimeManager;

    // Act
    await new SettingUpdater(repository, runtimeManager).execute(
      InstanceId.fromString(INSTANCE_ID), 'group@g.us', 'announcement'
    );

    // Assert
    expect(updateGroupSettings).toHaveBeenCalledWith('group@g.us', 'announcement');
  });
});
