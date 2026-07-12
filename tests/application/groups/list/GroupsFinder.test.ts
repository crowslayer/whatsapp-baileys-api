import { describe, expect, vi } from 'vitest';
import { GroupsFinder } from '../../../../src/application/groups/list/GroupsFinder';

describe('GroupsFinder', () => {
  const instanceId = 'inst-1';
  const mockGroups = [
    { id: 'g1', name: 'Group 1' },
    { id: 'g2', name: 'Group 2' },
  ];
  const mockFreshGroups = [{ id: 'g3', name: 'Group 3' }];

  test('execute returns groups from repository', async () => {
    const mockRepo = { findGroupsByInstance: vi.fn().mockResolvedValue(mockGroups) };
    const mockRuntime = { get: vi.fn() };
    const mockChatSync = { syncChats: vi.fn() };
    const finder = new GroupsFinder(mockRepo, mockRuntime, mockChatSync);

    const result = await finder.execute(instanceId);

    expect(result.groups).toEqual(mockGroups);
    expect(result.groupsCount).toBe(2);
    expect(mockRepo.findGroupsByInstance).toHaveBeenCalledWith(instanceId);
    expect(mockRuntime.get).not.toHaveBeenCalled();
  });

  test('execute syncs when no groups found', async () => {
    const mockRepo = {
      findGroupsByInstance: vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce(mockGroups),
    };
    const mockAdapter = {
      groups: { syncGroupsMetadata: vi.fn().mockResolvedValue(mockFreshGroups) },
    };
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) };
    const mockChatSync = { syncChats: vi.fn() };
    const finder = new GroupsFinder(mockRepo, mockRuntime, mockChatSync);

    const result = await finder.execute(instanceId);

    expect(result.groups).toEqual(mockGroups);
    expect(result.groupsCount).toBe(2);
    expect(mockRuntime.get).toHaveBeenCalledWith(instanceId);
    expect(mockAdapter.groups.syncGroupsMetadata).toHaveBeenCalled();
    expect(mockChatSync.syncChats).toHaveBeenCalledWith(instanceId, mockFreshGroups, false);
    expect(mockRepo.findGroupsByInstance).toHaveBeenCalledTimes(2);
  });

  test('execute throws when no groups and no adapter', async () => {
    const mockRepo = { findGroupsByInstance: vi.fn().mockResolvedValue([]) };
    const mockRuntime = { get: vi.fn().mockReturnValue(null) };
    const mockChatSync = { syncChats: vi.fn() };
    const finder = new GroupsFinder(mockRepo, mockRuntime, mockChatSync);

    await expect(finder.execute(instanceId)).rejects.toThrow('Instances Not Found');
  });
});
