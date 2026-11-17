import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ParticipantsRemover } from '@modules/groups/application/participants/remove/ParticipantsRemover';
import { RemoveParticipantsGroupCommand } from '@modules/groups/application/participants/remove/RemoveParticipantsGroupCommand';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import type { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

const INSTANCE_ID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f';

describe('ParticipantsRemover', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('removes the requested participants from a group', async () => {
    // Arrange
    const repository = { findById: vi.fn().mockResolvedValue({}) } as unknown as IInstanceRepository;
    const removeParticipantsFromGroup = vi.fn().mockResolvedValue(undefined);
    const runtimeManager = { get: vi.fn().mockReturnValue({ groups: { removeParticipantsFromGroup } }) } as unknown as IRuntimeManager;
    const command = new RemoveParticipantsGroupCommand(INSTANCE_ID, 'group@g.us', ['123@s.whatsapp.net']);

    // Act
    await new ParticipantsRemover(repository, runtimeManager).execute(command);

    // Assert
    expect(removeParticipantsFromGroup).toHaveBeenCalledWith('group@g.us', ['123@s.whatsapp.net']);
  });
});
