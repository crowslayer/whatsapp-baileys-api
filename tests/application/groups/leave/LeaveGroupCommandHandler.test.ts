import { LeaveGroupCommandHandler } from '../../../../src/application/groups/leave/LeaveGroupCommandHandler'
import { LeaveGroupCommand } from '../../../../src/application/groups/leave/LeaveGroupCommand'

describe('LeaveGroupCommandHandler', () => {
  test('subscribedTo returns LeaveGroupCommand', () => {
    const handler = new LeaveGroupCommandHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(LeaveGroupCommand)
  })

  test('handle calls leaver.execute with InstanceId and groupId', async () => {
    const mockLeaver = { execute: vi.fn().mockResolvedValue(undefined) }
    const handler = new LeaveGroupCommandHandler(mockLeaver)

    const command = new LeaveGroupCommand('inst-1', 'group-123')
    await handler.handle(command)

    expect(mockLeaver.execute).toHaveBeenCalledTimes(1)
    const [instanceId, groupId] = mockLeaver.execute.mock.calls[0]
    expect(instanceId.value).toBe('inst-1')
    expect(groupId).toBe('group-123')
  })
})
