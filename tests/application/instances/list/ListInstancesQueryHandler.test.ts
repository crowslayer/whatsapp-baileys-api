import { describe, expect, vi } from 'vitest';
import { InstancesResponse } from '../../../../src/application/instances/InstancesResponse';
import { ListInstancesQuery } from '../../../../src/application/instances/list/ListInstancesQuery';
import { ListInstancesQueryHandler } from '../../../../src/application/instances/list/ListInstancesQueryHandler';

describe('ListInstancesQueryHandler', () => {
  test('should return list of instances', async () => {
    const mockInstances = [{ instanceId: 'inst-1' }, { instanceId: 'inst-2' }];
    const mockSearcher = { execute: vi.fn().mockResolvedValue(mockInstances) };
    const handler = new ListInstancesQueryHandler(mockSearcher);

    const query = new ListInstancesQuery();
    const result = await handler.handle(query);
    expect(result).toBeInstanceOf(InstancesResponse);
  });

  test('subscribedTo returns ListInstancesQuery', () => {
    const handler = new ListInstancesQueryHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(ListInstancesQuery);
  });
});
