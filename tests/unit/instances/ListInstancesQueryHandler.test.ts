import { ListInstancesQueryHandler } from '../../../src/application/instances/list/ListInstancesQueryHandler'
import { ListInstancesQuery } from '../../../src/application/instances/list/ListInstancesQuery'
import { InstancesResponse } from '../../../src/application/instances/InstancesResponse'

describe('ListInstancesQueryHandler', () => {
  test('should return list of instances', async () => {
    const mockInstances = [{ instanceId: 'inst-1' }, { instanceId: 'inst-2' }]
    const mockSearcher = { execute: vi.fn().mockResolvedValue(mockInstances) }
    const handler = new ListInstancesQueryHandler(mockSearcher)

    const query = new ListInstancesQuery()
    const result = await handler.handle(query)
    expect(result).toBeInstanceOf(InstancesResponse)
  })

  test('subscribedTo returns ListInstancesQuery', () => {
    const handler = new ListInstancesQueryHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(ListInstancesQuery)
  })
})
