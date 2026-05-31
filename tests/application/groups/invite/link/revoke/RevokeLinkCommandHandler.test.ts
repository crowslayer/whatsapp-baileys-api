import { RevokeLinkCommandHandler } from '../../../../../../src/application/groups/invite/link/revoke/RevokeLinkCommandHandler'
import { RevokeLinkCommand } from '../../../../../../src/application/groups/invite/link/revoke/RevokeLinkCommand'

describe('RevokeLinkCommandHandler', () => {
  test('subscribedTo returns RevokeLinkCommand', () => {
    const handler = new RevokeLinkCommandHandler({ execute: vi.fn() })
    expect(handler.subscribedTo()).toBe(RevokeLinkCommand)
  })

  test('handle calls revoker.execute with InstanceId and groupId', async () => {
    const mockRevoker = { execute: vi.fn().mockResolvedValue('https://new.link') }
    const handler = new RevokeLinkCommandHandler(mockRevoker)

    const command = new RevokeLinkCommand('inst-1', 'group-123')
    const result = await handler.handle(command)

    expect(result).toBe('https://new.link')
    expect(mockRevoker.execute).toHaveBeenCalledTimes(1)
    const [instanceId, groupId] = mockRevoker.execute.mock.calls[0]
    expect(instanceId.value).toBe('inst-1')
    expect(groupId).toBe('group-123')
  })
})
