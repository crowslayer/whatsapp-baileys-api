import { InstancesSearcher } from '../../../src/application/instances/list/InstancesSearcher'

describe('InstancesSearcher', () => {
  test('execute returns mapped instances', async () => {
    const instances = [
      { instanceId: 'inst-1', name: 'Test 1', status: 'connected', phoneNumber: undefined, webhookUrl: 'http://hook.test', lastConnectedAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
      { instanceId: 'inst-2', name: 'Test 2', status: 'disconnected', phoneNumber: undefined, webhookUrl: undefined, lastConnectedAt: undefined, createdAt: new Date(), updatedAt: new Date() },
    ]
    const mockRepo = { findAll: vi.fn().mockResolvedValue(instances), findById: vi.fn() }
    const searcher = new InstancesSearcher(mockRepo)

    const result = await searcher.execute()
    expect(result).toHaveLength(2)
    expect(result[0].instanceId).toBe('inst-1')
    expect(result[1].instanceId).toBe('inst-2')
  })

  test('execute returns empty array when no instances', async () => {
    const mockRepo = { findAll: vi.fn().mockResolvedValue([]), findById: vi.fn() }
    const searcher = new InstancesSearcher(mockRepo)

    const result = await searcher.execute()
    expect(result).toEqual([])
  })
})
