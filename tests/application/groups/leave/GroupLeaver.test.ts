import { describe, expect, vi } from 'vitest';
import { GroupLeaver } from '../../../../src/application/groups/leave/GroupLeaver';
import { InstanceId } from '../../../../src/domain/value-objects/InstanceId';
import { WhatsAppConnectionError } from '../../../../src/shared/infrastructure/errors/WhatsAppConnectionError';

describe('GroupLeaver', () => {
  const instanceId = InstanceId.fromString('inst-1');

  test('execute calls adapter.groups.leaveGroup on success', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockAdapter = { groups: { leaveGroup: vi.fn().mockResolvedValue(undefined) } };
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) };
    const leaver = new GroupLeaver(mockRepo, mockRuntime);

    await leaver.execute(instanceId, 'group-123');

    expect(mockAdapter.groups.leaveGroup).toHaveBeenCalledWith('group-123');
  });

  test('execute throws WhatsAppConnectionError when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) };
    const mockRuntime = { get: vi.fn() };
    const leaver = new GroupLeaver(mockRepo, mockRuntime);

    await expect(leaver.execute(instanceId, 'group-123')).rejects.toThrow(WhatsAppConnectionError);
  });

  test('execute throws WhatsAppConnectionError when adapter not found', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockRuntime = { get: vi.fn().mockReturnValue(null) };
    const leaver = new GroupLeaver(mockRepo, mockRuntime);

    await expect(leaver.execute(instanceId, 'group-123')).rejects.toThrow(WhatsAppConnectionError);
  });
});
