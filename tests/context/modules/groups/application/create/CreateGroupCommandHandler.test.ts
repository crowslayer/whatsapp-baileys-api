import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateGroupCommandHandler } from '@modules/groups/application/create/CreateGroupCommandHandler';
import { CreateGroupCommand } from '@modules/groups/application/create/CreateGroupCommand';
import type { GroupCreator } from '@modules/groups/application/create/GroupCreator';

describe('CreateGroupCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('handles its command and returns the created group id', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue('group@g.us') } as unknown as GroupCreator;
    const handler = new CreateGroupCommandHandler(useCase);
    const command = new CreateGroupCommand('instance-1', 'Team', []);

    // Act
    const result = await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(CreateGroupCommand);
    expect(useCase.execute).toHaveBeenCalledWith(command);
    expect(result).toBe('group@g.us');
  });
});
