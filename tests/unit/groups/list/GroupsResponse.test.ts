import { GroupsResponse } from '../../../../src/application/groups/list/GroupsResponse'

describe('GroupsResponse', () => {
  test('create with data returns response with content', () => {
    const data = { groups: [{ id: 'g1' }], groupsCount: 1 }
    const response = GroupsResponse.create(data)
    expect(response.content).toEqual(data)
  })

  test('none() returns empty response', () => {
    const response = GroupsResponse.none()
    expect(response.content).toEqual({ groups: [], groupsCount: 0 })
  })

  test('create with null returns empty response', () => {
    const response = GroupsResponse.create(null as any)
    expect(response.content).toEqual({ groups: [], groupsCount: 0 })
  })
})
