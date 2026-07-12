import { describe, expect, vi } from 'vitest';
import { AddParticipantGroupCommand } from '../../../../../src/application/groups/participants/add/AddParticipantGroupCommand';
import { AddParticipantGroupCommandHandler } from '../../../../../src/application/groups/participants/add/AddParticipantGroupCommandHandler';

describe('AddParticipantGroupCommandHandler', () => {
  test('subscribedTo returns AddParticipantGroupCommand', () => {
    const handler = new AddParticipantGroupCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(AddParticipantGroupCommand);
  });

  test('handle calls aggregator.execute with the command', async () => {
    const mockAggregator = { execute: vi.fn().mockResolvedValue(undefined) };
    const handler = new AddParticipantGroupCommandHandler(mockAggregator);

    const command = new AddParticipantGroupCommand('inst-1', 'group-123', ['jid1']);
    await handler.handle(command);

    expect(mockAggregator.execute).toHaveBeenCalledWith(command);
  });
});
