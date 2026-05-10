import { InstanceResponse } from '../../../src/application/instances/InstanceResponse'

describe('InstanceResponse', () => {
  test('create wraps instance', () => {
    const instance = { instanceId: 'inst-1', name: 'Test', status: 'connected' }
    const response = InstanceResponse.create(instance)
    expect(response.content).toBe(instance)
  })

  test('content returns the instance', () => {
    const instance = { instanceId: 'inst-2', name: 'Test 2', status: 'disconnected' }
    const response = InstanceResponse.create(instance)
    expect(response.content.instanceId).toBe('inst-2')
  })
})
