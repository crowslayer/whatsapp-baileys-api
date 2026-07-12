import { describe, expect, vi } from 'vitest';
import { ParticipantsDemoter } from '../../../../../src/application/groups/participants/demote/ParticipantsDemoter';
import { InstanceId } from '../../../../../src/domain/value-objects/InstanceId';
import { WhatsAppConnectionError } from '../../../../../src/shared/infrastructure/errors/WhatsAppConnectionError';

describe('ParticipantsDemoter', () => {
  const instanceId = InstanceId.fromString('inst-1');

  test('execute demotes participants successfully', async () => {
    const mockInstance = { instanceId: 'inst-1', canSendMessages: () => false };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockAdapter = { groups: { demoteParticipants: vi.fn().mockResolvedValue(undefined) } };
    const mockRuntime = { get: vi.fn().mockReturnValue(mockAdapter) };
    const demoter = new ParticipantsDemoter(mockRepo, mockRuntime);

    await demoter.execute(instanceId, 'group-123', ['jid1', 'jid2']);

    expect(mockAdapter.groups.demoteParticipants).toHaveBeenCalledWith('group-123', [
      'jid1',
      'jid2',
    ]);
  });

  test('throws WhatsAppConnectionError when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null) };
    const mockRuntime = { get: vi.fn() };
    const demoter = new ParticipantsDemoter(mockRepo, mockRuntime);

    await expect(demoter.execute(instanceId, 'group-123', ['jid1'])).rejects.toThrow(
      WhatsAppConnectionError
    );
  });

  test('throws WhatsAppConnectionError when instance.canSendMessages() is true (current buggy behavior)', async () => {
    const mockInstance = { canSendMessages: () => true };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockRuntime = { get: vi.fn() };
    const demoter = new ParticipantsDemoter(mockRepo, mockRuntime);

    await expect(demoter.execute(instanceId, 'group-123', ['jid1'])).rejects.toThrow(
      WhatsAppConnectionError
    );
  });

  test('throws WhatsAppConnectionError when adapter not found', async () => {
    const mockInstance = { instanceId: 'inst-1', canSendMessages: () => false };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const mockRuntime = { get: vi.fn().mockReturnValue(null) };
    const demoter = new ParticipantsDemoter(mockRepo, mockRuntime);

    await expect(demoter.execute(instanceId, 'group-123', ['jid1'])).rejects.toThrow(
      WhatsAppConnectionError
    );
  });
});
