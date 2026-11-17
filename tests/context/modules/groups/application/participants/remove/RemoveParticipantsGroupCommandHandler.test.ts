import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RemoveParticipantsGroupCommandHandler } from '@modules/groups/application/participants/remove/RemoveParticipantsGroupCommandHandler';
import { RemoveParticipantsGroupCommand } from '@modules/groups/application/participants/remove/RemoveParticipantsGroupCommand';
import type { ParticipantsRemover } from '@modules/groups/application/participants/remove/ParticipantsRemover';

describe('RemoveParticipantsGroupCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('delegates the remove participants command', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as ParticipantsRemover;
    const handler = new RemoveParticipantsGroupCommandHandler(useCase);
    const command = new RemoveParticipantsGroupCommand('instance-1', 'group@g.us', ['jid']);

    // Act
    await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(RemoveParticipantsGroupCommand);
    expect(useCase.execute).toHaveBeenCalledWith(command);
  });
});
