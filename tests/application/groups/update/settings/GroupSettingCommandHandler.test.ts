import { GroupSettingCommandHandler } from '../../../../../src/application/groups/update/settings/GroupSettingCommandHandler'
import { GroupSettingCommand } from '../../../../../src/application/groups/update/settings/GroupSettingCommand'

describe('GroupSettingCommandHandler', () => {
  test('subscribedTo returns GroupSettingCommand', () => {
    const handler = new GroupSettingCommandHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(GroupSettingCommand)
  })

  test('handle with announcement calls updater with announcement setting', async () => {
    const mockUpdater = { execute: vi.fn().mockResolvedValue(undefined) }
    const handler = new GroupSettingCommandHandler(mockUpdater)

    const command = new GroupSettingCommand('inst-1', 'group-123', true)
    await handler.handle(command)

    expect(mockUpdater.execute).toHaveBeenCalledTimes(1)
    const [instanceId, groupId, setting] = mockUpdater.execute.mock.calls[0]
    expect(instanceId.value).toBe('inst-1')
    expect(groupId).toBe('group-123')
    expect(setting).toBe('announcement')
  })

  test('handle with locked calls updater with locked setting', async () => {
    const mockUpdater = { execute: vi.fn().mockResolvedValue(undefined) }
    const handler = new GroupSettingCommandHandler(mockUpdater)

    const command = new GroupSettingCommand('inst-1', 'group-123', undefined, true)
    await handler.handle(command)

    expect(mockUpdater.execute).toHaveBeenCalledTimes(1)
    const [instanceId, groupId, setting] = mockUpdater.execute.mock.calls[0]
    expect(instanceId.value).toBe('inst-1')
    expect(groupId).toBe('group-123')
    expect(setting).toBe('locked')
  })

  test('handle with both calls updater twice', async () => {
    const mockUpdater = { execute: vi.fn().mockResolvedValue(undefined) }
    const handler = new GroupSettingCommandHandler(mockUpdater)

    const command = new GroupSettingCommand('inst-1', 'group-123', true, true)
    await handler.handle(command)

    expect(mockUpdater.execute).toHaveBeenCalledTimes(2)
    expect(mockUpdater.execute.mock.calls[0][2]).toBe('announcement')
    expect(mockUpdater.execute.mock.calls[1][2]).toBe('locked')
  })

  test('handle with neither returns early', async () => {
    const mockUpdater = { execute: vi.fn() }
    const handler = new GroupSettingCommandHandler(mockUpdater)

    const command = new GroupSettingCommand('inst-1', 'group-123')
    await handler.handle(command)

    expect(mockUpdater.execute).not.toHaveBeenCalled()
  })
})
