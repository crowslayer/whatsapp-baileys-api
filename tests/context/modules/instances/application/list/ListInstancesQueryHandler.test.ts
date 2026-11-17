import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ListInstancesQueryHandler } from '@modules/instances/application/list/ListInstancesQueryHandler';
import { ListInstancesQuery } from '@modules/instances/application/list/ListInstancesQuery';
import { InstancesSearcher } from '@modules/instances/application/list/InstancesSearcher';

describe('ListInstancesQueryHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('wraps the instances returned by the searcher', async () => {
    // Arrange
    const searcher = { execute: vi.fn().mockResolvedValue([]) } as unknown as InstancesSearcher;
    const handler = new ListInstancesQueryHandler(searcher);

    // Act
    const response = await handler.handle(new ListInstancesQuery());

    // Assert
    expect(handler.subscribedTo()).toBe(ListInstancesQuery);
    expect(response.content).toEqual([]);
  });
});
