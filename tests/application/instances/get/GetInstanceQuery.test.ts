import { GetInstanceQuery } from '../../../../src/application/instances/get/GetInstanceQuery'

describe('GetInstanceQuery', () => {
  test('constructor sets instanceId', () => {
    const query = new GetInstanceQuery('inst-1')
    expect(query.instanceId).toBe('inst-1')
  })
})
