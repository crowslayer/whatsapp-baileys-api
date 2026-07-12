import { describe, expect, vi } from 'vitest';
import { DescriptionUpdater } from '../../../../../src/application/groups/update/description/DescriptionUpdater';
import { InstanceId } from '../../../../../src/domain/value-objects/InstanceId';
import { WhatsAppConnectionError } from '../../../../../src/shared/infrastructure/errors/WhatsAppConnectionError';

describe('DescriptionUpdater', () => {
  const instanceId = InstanceId.fromString('inst-1');

  test('execute calls adapter.groups.updateGroupDescription', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockAdapter = {
      groups: { updateGroupDescription: vi.fn().mockResolvedValue(undefined) },
    };
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) };
    const updater = new DescriptionUpdater(mockRepo, mockRuntime);

    await updater.execute(instanceId, 'group-123', 'New Description');

    expect(mockAdapter.groups.updateGroupDescription).toHaveBeenCalledWith(
      'group-123',
      'New Description'
    );
  });

  test('throws WhatsAppConnectionError when instance not found or not connected', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) };
    const mockRuntime = { get: vi.fn() };
    const updater = new DescriptionUpdater(mockRepo, mockRuntime);

    await expect(updater.execute(instanceId, 'group-123', 'Desc')).rejects.toThrow(
      WhatsAppConnectionError
    );
  });

  test('throws WhatsAppConnectionError when adapter not found', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockRuntime = { get: vi.fn().mockReturnValue(null) };
    const updater = new DescriptionUpdater(mockRepo, mockRuntime);

    await expect(updater.execute(instanceId, 'group-123', 'Desc')).rejects.toThrow(
      WhatsAppConnectionError
    );
  });
});
