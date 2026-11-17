import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AddParticipantGroupCommandHandler } from '@modules/groups/application/participants/add/AddParticipantGroupCommandHandler';
import { AddParticipantGroupCommand } from '@modules/groups/application/participants/add/AddParticipantGroupCommand';
import type { ParticipantsAggregator } from '@modules/groups/application/participants/add/ParticipantsAggregator';

describe('AddParticipantGroupCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('delegates the add participants command', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as ParticipantsAggregator;
    const handler = new AddParticipantGroupCommandHandler(useCase);
    const command = new AddParticipantGroupCommand('instance-1', 'group@g.us', ['jid']);

    // Act
    await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(AddParticipantGroupCommand);
    expect(useCase.execute).toHaveBeenCalledWith(command);
  });
});
