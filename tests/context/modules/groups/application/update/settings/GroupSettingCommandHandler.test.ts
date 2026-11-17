import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GroupSettingCommandHandler } from '@modules/groups/application/update/settings/GroupSettingCommandHandler';
import { GroupSettingCommand } from '@modules/groups/application/update/settings/GroupSettingCommand';
import type { SettingUpdater } from '@modules/groups/application/update/settings/SettingUpdater';

describe('GroupSettingCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('maps announcement and locked flags to their respective settings', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as SettingUpdater;
    const handler = new GroupSettingCommandHandler(useCase);
    const command = new GroupSettingCommand('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', 'group@g.us', true, false);

    // Act
    await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(GroupSettingCommand);
    expect(useCase.execute).toHaveBeenNthCalledWith(1, expect.objectContaining({ value: command.instanceId }), command.groupId, 'announcement');
    expect(useCase.execute).toHaveBeenNthCalledWith(2, expect.objectContaining({ value: command.instanceId }), command.groupId, 'unlocked');
  });

  it('does nothing when neither flag is supplied', async () => {
    // Arrange
    const useCase = { execute: vi.fn() } as unknown as SettingUpdater;
    const handler = new GroupSettingCommandHandler(useCase);

    // Act
    await handler.handle(new GroupSettingCommand('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', 'group@g.us'));

    // Assert
    expect(useCase.execute).not.toHaveBeenCalled();
  });
});
