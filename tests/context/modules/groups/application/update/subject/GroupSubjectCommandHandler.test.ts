import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GroupSubjectCommandHandler } from '@modules/groups/application/update/subject/GroupSubjectCommandHandler';
import { GroupSubjectCommand } from '@modules/groups/application/update/subject/GroupSubjectCommand';
import type { SubjetUpdater } from '@modules/groups/application/update/subject/SubjectUpdater';

describe('GroupSubjectCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('converts the instance id and delegates the subject update', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as SubjetUpdater;
    const handler = new GroupSubjectCommandHandler(useCase);
    const command = new GroupSubjectCommand('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', 'group@g.us', 'New subject');

    // Act
    await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(GroupSubjectCommand);
    expect(useCase.execute).toHaveBeenCalledWith(expect.objectContaining({ value: command.instanceId }), command.groupId, command.subject);
  });
});
