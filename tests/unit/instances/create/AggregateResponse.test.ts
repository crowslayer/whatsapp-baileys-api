import { AggregateResponse } from '../../../../src/application/instances/create/AggregateResponse'

describe('AggregateResponse', () => {
  test('create wraps instance with toJSON', () => {
    const instance = {
      instanceId: 'inst-1',
      name: 'Test',
      status: 'connected',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const response = AggregateResponse.create(instance)
    expect(response.content.instanceId).toBe('inst-1')
  })

  test('content properties', () => {
    const instance = {
      instanceId: 'inst-2',
      name: 'Test 2',
      status: 'disconnected',
      phoneNumber: '5215512345678',
      webhookUrl: 'http://hook.test',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const response = AggregateResponse.create(instance)
    expect(response.content.name).toBe('Test 2')
    expect(response.content.phoneNumber).toBe('5215512345678')
  })
})
