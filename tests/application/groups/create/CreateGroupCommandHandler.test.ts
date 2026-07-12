import { describe, expect, vi } from 'vitest';
import { CreateGroupCommand } from '../../../../src/application/groups/create/CreateGroupCommand';
import { CreateGroupCommandHandler } from '../../../../src/application/groups/create/CreateGroupCommandHandler';

describe('CreateGroupCommandHandler', () => {
  test('should delegate to GroupCreator', async () => {
    const mockCreator = { execute: vi.fn().mockResolvedValue('group-id') };
    const handler = new CreateGroupCommandHandler(mockCreator);

    const command = new CreateGroupCommand('inst-1', 'Group', ['jid1']);
    const result = await handler.handle(command);
    expect(result).toBe('group-id');
    expect(mockCreator.execute).toHaveBeenCalledWith(command);
  });

  test('subscribedTo returns CreateGroupCommand', () => {
    const handler = new CreateGroupCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(CreateGroupCommand);
  });
});
