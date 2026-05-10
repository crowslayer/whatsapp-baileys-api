import { GetInstanceQueryHandler } from '../../../src/application/instances/get/GetInstanceQueryHandler'
import { GetInstanceQuery } from '../../../src/application/instances/get/GetInstanceQuery'
import { InstanceResponse } from '../../../src/application/instances/InstanceResponse'

describe('GetInstanceQueryHandler', () => {
  test('should return instance response', async () => {
    const mockInstance = { instanceId: 'inst-1', name: { value: 'Test' }, status: { value: 'connected' } }
    const mockFinder = { execute: vi.fn().mockResolvedValue(mockInstance) }
    const handler = new GetInstanceQueryHandler(mockFinder)

    const query = new GetInstanceQuery('inst-1')
    const result = await handler.handle(query)
    expect(result).toBeInstanceOf(InstanceResponse)
  })

  test('subscribedTo returns GetInstanceQuery', () => {
    const handler = new GetInstanceQueryHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(GetInstanceQuery)
  })
})
