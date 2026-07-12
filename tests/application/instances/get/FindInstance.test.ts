import { describe, expect, vi } from 'vitest';
import { FindInstance } from '../../../../src/application/instances/get/FindInstance';
import { InstanceId } from '../../../../src/domain/value-objects/InstanceId';

describe('FindInstance', () => {
  test('execute returns instance from repository', async () => {
    const found = {
      instanceId: 'inst-1',
      name: 'Test',
      status: 'connected',
      phoneNumber: '5215512345678',
      webhookUrl: 'http://hook.test',
      lastConnectedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockRepo = { findById: vi.fn().mockResolvedValue(found), findAll: vi.fn() };
    const finder = new FindInstance(mockRepo);

    const result = await finder.execute(InstanceId.fromString('inst-1'));
    expect(result.instanceId).toBe('inst-1');
    expect(result.phoneNumber).toBe('5215512345678');
  });

  test('execute throws Error when instance not found', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue(null), findAll: vi.fn() };
    const finder = new FindInstance(mockRepo);

    await expect(finder.execute(InstanceId.fromString('inst-none'))).rejects.toThrow(
      'Instance not found'
    );
  });
});
