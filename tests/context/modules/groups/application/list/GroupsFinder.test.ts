import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GroupsFinder } from '@modules/groups/application/list/GroupsFinder';
import type { IChatReadRepository } from '@modules/chats/domain/IChatReadRepository';
import type { IChatSynchronizer } from '@modules/chats/application/synchronize/IChatSynchronizer';
import type { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

describe('GroupsFinder', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns cached groups without requesting a runtime sync', async () => {
    // Arrange
    const groups = [{ chatId: 'group@g.us', instanceId: 'instance-1', name: 'Team', type: 'group' as const, unreadCount: 0, isArchived: false, isMuted: false }];
    const repository = { findGroupsByInstance: vi.fn().mockResolvedValue(groups) } as unknown as IChatReadRepository;
    const runtimeManager = { get: vi.fn() } as unknown as IRuntimeManager;
    const chatSync = { syncChats: vi.fn() } as unknown as IChatSynchronizer;

    // Act
    const result = await new GroupsFinder(repository, runtimeManager, chatSync).execute('instance-1');

    // Assert
    expect(result).toEqual({ groups, groupsCount: 1 });
    expect(runtimeManager.get).not.toHaveBeenCalled();
  });

  it('syncs groups when the repository has no cached groups', async () => {
    // Arrange
    const freshGroups = [{ chatId: 'group@g.us', instanceId: 'other', name: 'Team', type: 'group' as const, unreadCount: 0, isArchived: false, isMuted: false }];
    const repository = { findGroupsByInstance: vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce(freshGroups) } as unknown as IChatReadRepository;
    const runtimeManager = { get: vi.fn().mockReturnValue({ groups: { syncGroupsMetadata: vi.fn().mockResolvedValue(freshGroups) } }) } as unknown as IRuntimeManager;
    const chatSync = { syncChats: vi.fn().mockResolvedValue(undefined) } as unknown as IChatSynchronizer;

    // Act
    const result = await new GroupsFinder(repository, runtimeManager, chatSync).execute('instance-1');

    // Assert
    expect(chatSync.syncChats).toHaveBeenCalledWith('instance-1', [{ ...freshGroups[0], instanceId: 'instance-1' }], false);
    expect(result.groupsCount).toBe(1);
  });
});
