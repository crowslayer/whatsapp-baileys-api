import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GroupDescriptionCommandHandler } from '@modules/groups/application/update/description/GroupDescriptionCommandHandler';
import { GroupDescriptionCommand } from '@modules/groups/application/update/description/GroupDescriptionCommand';
import type { DescriptionUpdater } from '@modules/groups/application/update/description/DescriptionUpdater';

describe('GroupDescriptionCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('converts the instance id and delegates the description update', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as DescriptionUpdater;
    const handler = new GroupDescriptionCommandHandler(useCase);
    const command = new GroupDescriptionCommand('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', 'group@g.us', 'Description');

    // Act
    await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(GroupDescriptionCommand);
    expect(useCase.execute).toHaveBeenCalledWith(expect.objectContaining({ value: command.instanceId }), command.groupId, command.description);
  });
});
