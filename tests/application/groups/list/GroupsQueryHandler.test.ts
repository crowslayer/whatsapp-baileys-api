import { describe, expect, vi } from 'vitest';
import { GroupsQuery } from '../../../../src/application/groups/list/GroupsQuery';
import { GroupsQueryHandler } from '../../../../src/application/groups/list/GroupsQueryHandler';
import { GroupsResponse } from '../../../../src/application/groups/list/GroupsResponse';

describe('GroupsQueryHandler', () => {
  test('subscribedTo returns GroupsQuery', () => {
    const handler = new GroupsQueryHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(GroupsQuery);
  });

  test('handle calls finder and wraps in GroupsResponse', async () => {
    const result = { groups: [{ id: 'g1' }], groupsCount: 1 };
    const mockFinder = { execute: vi.fn().mockResolvedValue(result) };
    const handler = new GroupsQueryHandler(mockFinder);

    const query = new GroupsQuery('inst-1');
    const response = await handler.handle(query);

    expect(response).toBeInstanceOf(GroupsResponse);
    expect(response.content).toEqual(result);
    expect(mockFinder.execute).toHaveBeenCalledWith('inst-1');
  });
});
