import { describe, expect, vi } from 'vitest';
import { GroupDescriptionCommand } from '../../../../../src/application/groups/update/description/GroupDescriptionCommand';
import { GroupDescriptionCommandHandler } from '../../../../../src/application/groups/update/description/GroupDescriptionCommandHandler';

describe('GroupDescriptionCommandHandler', () => {
  test('subscribedTo returns GroupDescriptionCommand', () => {
    const handler = new GroupDescriptionCommandHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(GroupDescriptionCommand);
  });

  test('handle calls updater.execute with InstanceId, groupId and description', async () => {
    const mockUpdater = { execute: vi.fn().mockResolvedValue(undefined) };
    const handler = new GroupDescriptionCommandHandler(mockUpdater);

    const command = new GroupDescriptionCommand('inst-1', 'group-123', 'New Description');
    await handler.handle(command);

    expect(mockUpdater.execute).toHaveBeenCalledTimes(1);
    const [instanceId, groupId, description] = mockUpdater.execute.mock.calls[0];
    expect(instanceId.value).toBe('inst-1');
    expect(groupId).toBe('group-123');
    expect(description).toBe('New Description');
  });
});
