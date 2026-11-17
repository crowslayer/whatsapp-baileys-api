import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DemoteParticipantsCommandHandler } from '@modules/groups/application/participants/demote/DemoteParticipantsCommandHandler';
import { DemoteParticipantsCommand } from '@modules/groups/application/participants/demote/DemoteParticipantsCommand';
import type { ParticipantsDemoter } from '@modules/groups/application/participants/demote/ParticipantsDemoter';

describe('DemoteParticipantsCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('converts the instance id and delegates demotion', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as ParticipantsDemoter;
    const handler = new DemoteParticipantsCommandHandler(useCase);
    const command = new DemoteParticipantsCommand('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', 'group@g.us', ['jid']);

    // Act
    await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(DemoteParticipantsCommand);
    expect(useCase.execute).toHaveBeenCalledWith(expect.objectContaining({ value: command.instanceId }), command.groupId, command.participants);
  });
});
