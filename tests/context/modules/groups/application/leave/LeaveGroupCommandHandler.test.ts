import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LeaveGroupCommandHandler } from '@modules/groups/application/leave/LeaveGroupCommandHandler';
import { LeaveGroupCommand } from '@modules/groups/application/leave/LeaveGroupCommand';
import type { GroupLeaver } from '@modules/groups/application/leave/GroupLeaver';

describe('LeaveGroupCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('converts the instance id and delegates the leave request', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as GroupLeaver;
    const handler = new LeaveGroupCommandHandler(useCase);
    const command = new LeaveGroupCommand('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', 'group@g.us');

    // Act
    await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(LeaveGroupCommand);
    expect(useCase.execute).toHaveBeenCalledWith(expect.objectContaining({ value: command.instanceId }), command.groupId);
  });
});
