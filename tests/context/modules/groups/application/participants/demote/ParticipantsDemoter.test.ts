import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ParticipantsDemoter } from '@modules/groups/application/participants/demote/ParticipantsDemoter';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import type { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

const INSTANCE_ID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f';

describe('ParticipantsDemoter', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('demotes participants for a connected instance', async () => {
    // Arrange
    const instance = { instanceId: INSTANCE_ID, canSendMessages: () => true };
    const repository = { findById: vi.fn().mockResolvedValue(instance) } as unknown as IInstanceRepository;
    const demoteParticipants = vi.fn().mockResolvedValue(undefined);
    const runtimeManager = { get: vi.fn().mockReturnValue({ groups: { demoteParticipants } }) } as unknown as IRuntimeManager;

    // Act
    await new ParticipantsDemoter(repository, runtimeManager).execute(
      InstanceId.fromString(INSTANCE_ID), 'group@g.us', ['123@s.whatsapp.net']
    );

    // Assert
    expect(demoteParticipants).toHaveBeenCalledWith('group@g.us', ['123@s.whatsapp.net']);
  });
});
