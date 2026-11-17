import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PromoteParticipantsCommandHandler } from '@modules/groups/application/participants/promote/PromoteParticipantsCommandHandler';
import { PromoteParticipantsCommand } from '@modules/groups/application/participants/promote/PromoteParticipantsCommand';
import type { ParticipantPromoter } from '@modules/groups/application/participants/promote/ParticipantPromoter';

describe('PromoteParticipantsCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('converts the instance id and delegates promotion', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as ParticipantPromoter;
    const handler = new PromoteParticipantsCommandHandler(useCase);
    const command = new PromoteParticipantsCommand('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', 'group@g.us', ['jid']);

    // Act
    await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(PromoteParticipantsCommand);
    expect(useCase.execute).toHaveBeenCalledWith(expect.objectContaining({ value: command.instanceId }), command.groupId, command.participants);
  });
});
