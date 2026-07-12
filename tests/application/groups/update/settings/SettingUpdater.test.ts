import { describe, expect, vi } from 'vitest';
import { SettingUpdater } from '../../../../../src/application/groups/update/settings/SettingUpdater';
import { InstanceId } from '../../../../../src/domain/value-objects/InstanceId';
import { WhatsAppConnectionError } from '../../../../../src/shared/infrastructure/errors/WhatsAppConnectionError';

describe('SettingUpdater', () => {
  const instanceId = InstanceId.fromString('inst-1');

  const mockInstance = { canSendMessages: () => true };
  const mockAdapter = { groups: { updateGroupSettings: vi.fn().mockResolvedValue(undefined) } };

  test('execute with announcement calls adapter.groups.updateGroupSettings', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) };
    const updater = new SettingUpdater(mockRepo, mockRuntime);

    await updater.execute(instanceId, 'group-123', 'announcement');

    expect(mockAdapter.groups.updateGroupSettings).toHaveBeenCalledWith(
      'group-123',
      'announcement'
    );
  });

  test('execute with not_announcement calls adapter', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) };
    const updater = new SettingUpdater(mockRepo, mockRuntime);

    await updater.execute(instanceId, 'group-123', 'not_announcement');

    expect(mockAdapter.groups.updateGroupSettings).toHaveBeenCalledWith(
      'group-123',
      'not_announcement'
    );
  });

  test('execute with locked calls adapter', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) };
    const updater = new SettingUpdater(mockRepo, mockRuntime);

    await updater.execute(instanceId, 'group-123', 'locked');

    expect(mockAdapter.groups.updateGroupSettings).toHaveBeenCalledWith('group-123', 'locked');
  });

  test('throws WhatsAppConnectionError when instance not found or not connected', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) };
    const mockRuntime = { get: vi.fn() };
    const updater = new SettingUpdater(mockRepo, mockRuntime);

    await expect(updater.execute(instanceId, 'group-123', 'announcement')).rejects.toThrow(
      WhatsAppConnectionError
    );
  });

  test('throws WhatsAppConnectionError when adapter not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockRuntime = { get: vi.fn().mockReturnValue(null) };
    const updater = new SettingUpdater(mockRepo, mockRuntime);

    await expect(updater.execute(instanceId, 'group-123', 'announcement')).rejects.toThrow(
      WhatsAppConnectionError
    );
  });
});
