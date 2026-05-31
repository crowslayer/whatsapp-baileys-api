import { ListInstancesQuery } from '../../../../src/application/instances/list/ListInstancesQuery'

describe('ListInstancesQuery', () => {
  test('constructor works (no args)', () => {
    const query = new ListInstancesQuery()
    expect(query).toBeInstanceOf(ListInstancesQuery)
  })
})
