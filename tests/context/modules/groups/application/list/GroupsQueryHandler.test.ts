import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GroupsQueryHandler } from '@modules/groups/application/list/GroupsQueryHandler';
import { GroupsQuery } from '@modules/groups/application/list/GroupsQuery';
import { GroupsResponse } from '@modules/groups/application/list/GroupsResponse';
import type { IChat } from '@modules/chats/domain/IChat';
import type { GroupsFinder } from '@modules/groups/application/list/GroupsFinder';

describe('GroupsQueryHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('subscribes to the groups query and wraps the finder result', async () => {
    // Arrange
    const groups: IChat[] = [];
    const useCase = { execute: vi.fn().mockResolvedValue({ groups, groupsCount: 0 }) } as unknown as GroupsFinder;
    const handler = new GroupsQueryHandler(useCase);
    const query = new GroupsQuery('instance-1');

    // Act
    const response = await handler.handle(query);

    // Assert
    expect(handler.subscribedTo()).toBe(GroupsQuery);
    expect(useCase.execute).toHaveBeenCalledWith('instance-1');
    expect(response).toBeInstanceOf(GroupsResponse);
    expect(response.content).toEqual({ groups: [], groupsCount: 0 });
  });
});
