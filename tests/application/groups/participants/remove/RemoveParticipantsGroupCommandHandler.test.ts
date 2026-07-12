import { describe, expect, vi } from 'vitest';
import { RemoveParticipantsGroupCommand } from '../../../../../src/application/groups/participants/remove/RemoveParticipantsGroupCommand';
import { RemoveParticipantsGroupCommandHandler } from '../../../../../src/application/groups/participants/remove/RemoveParticipantsGroupCommandHandler';

describe('RemoveParticipantsGroupCommandHandler', () => {
  test('subscribedTo returns RemoveParticipantsGroupCommand', () => {
    const handler = new RemoveParticipantsGroupCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(RemoveParticipantsGroupCommand);
  });

  test('handle calls remover.execute with the command', async () => {
    const mockRemover = { execute: vi.fn().mockResolvedValue(undefined) };
    const handler = new RemoveParticipantsGroupCommandHandler(mockRemover);

    const command = new RemoveParticipantsGroupCommand('inst-1', 'group-123', ['jid1']);
    await handler.handle(command);

    expect(mockRemover.execute).toHaveBeenCalledWith(command);
  });
});
