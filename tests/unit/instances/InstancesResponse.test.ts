import { InstancesResponse } from '../../../src/application/instances/InstancesResponse'

describe('InstancesResponse', () => {
  test('create with array returns response', () => {
    const instances = [{ instanceId: 'inst-1' }, { instanceId: 'inst-2' }]
    const response = InstancesResponse.create(instances)
    expect(response.content).toEqual(instances)
  })

  test('none() returns empty response', () => {
    const response = InstancesResponse.none()
    expect(response.content).toEqual([])
  })
})
