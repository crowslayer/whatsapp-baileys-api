import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ParticipantsAggregator } from '@modules/groups/application/participants/add/ParticipantsAggregator';
import { AddParticipantGroupCommand } from '@modules/groups/application/participants/add/AddParticipantGroupCommand';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import type { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

const INSTANCE_ID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f';

describe('ParticipantsAggregator', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('adds the requested participants to a group', async () => {
    // Arrange
    const repository = { findById: vi.fn().mockResolvedValue({}) } as unknown as IInstanceRepository;
    const addParticipantsToGroup = vi.fn().mockResolvedValue(undefined);
    const runtimeManager = { get: vi.fn().mockReturnValue({ groups: { addParticipantsToGroup } }) } as unknown as IRuntimeManager;
    const command = new AddParticipantGroupCommand(INSTANCE_ID, 'group@g.us', ['123@s.whatsapp.net']);

    // Act
    await new ParticipantsAggregator(repository, runtimeManager).execute(command);

    // Assert
    expect(addParticipantsToGroup).toHaveBeenCalledWith('group@g.us', ['123@s.whatsapp.net']);
  });

  it('rejects if the instance cannot be loaded', async () => {
    // Arrange
    const repository = { findById: vi.fn().mockResolvedValue(null) } as unknown as IInstanceRepository;
    const runtimeManager = { get: vi.fn() } as unknown as IRuntimeManager;

    // Act / Assert
    await expect(new ParticipantsAggregator(repository, runtimeManager).execute(
      new AddParticipantGroupCommand(INSTANCE_ID, 'group@g.us', [])
    )).rejects.toThrow('Instance');
  });
});
