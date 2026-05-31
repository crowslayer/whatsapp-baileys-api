import { GroupSubjectCommandHandler } from '../../../../../src/application/groups/update/subject/GroupSubjectCommandHandler'
import { GroupSubjectCommand } from '../../../../../src/application/groups/update/subject/GroupSubjectCommand'

describe('GroupSubjectCommandHandler', () => {
  test('subscribedTo returns GroupSubjectCommand', () => {
    const handler = new GroupSubjectCommandHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(GroupSubjectCommand)
  })

  test('handle calls updater.execute with InstanceId, groupId and subject', async () => {
    const mockUpdater = { execute: vi.fn().mockResolvedValue(undefined) }
    const handler = new GroupSubjectCommandHandler(mockUpdater)

    const command = new GroupSubjectCommand('inst-1', 'group-123', 'New Subject')
    await handler.handle(command)

    expect(mockUpdater.execute).toHaveBeenCalledTimes(1)
    const [instanceId, groupId, subject] = mockUpdater.execute.mock.calls[0]
    expect(instanceId.value).toBe('inst-1')
    expect(groupId).toBe('group-123')
    expect(subject).toBe('New Subject')
  })
})
