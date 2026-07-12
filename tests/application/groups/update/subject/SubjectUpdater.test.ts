import { describe, expect, vi } from 'vitest';
import { SubjetUpdater } from '../../../../../src/application/groups/update/subject/SubjectUpdater';
import { InstanceId } from '../../../../../src/domain/value-objects/InstanceId';
import { WhatsAppConnectionError } from '../../../../../src/shared/infrastructure/errors/WhatsAppConnectionError';

describe('SubjetUpdater', () => {
  const instanceId = InstanceId.fromString('inst-1');

  test('execute calls adapter.groups.updateGroupSubject', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockAdapter = { groups: { updateGroupSubject: vi.fn().mockResolvedValue(undefined) } };
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) };
    const updater = new SubjetUpdater(mockRepo, mockRuntime);

    await updater.execute(instanceId, 'group-123', 'New Subject');

    expect(mockAdapter.groups.updateGroupSubject).toHaveBeenCalledWith('group-123', 'New Subject');
  });

  test('throws WhatsAppConnectionError when instance not found or not connected', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) };
    const mockRuntime = { get: vi.fn() };
    const updater = new SubjetUpdater(mockRepo, mockRuntime);

    await expect(updater.execute(instanceId, 'group-123', 'Subject')).rejects.toThrow(
      WhatsAppConnectionError
    );
  });

  test('throws WhatsAppConnectionError when adapter not found', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockRuntime = { get: vi.fn().mockReturnValue(null) };
    const updater = new SubjetUpdater(mockRepo, mockRuntime);

    await expect(updater.execute(instanceId, 'group-123', 'Subject')).rejects.toThrow(
      WhatsAppConnectionError
    );
  });
});
