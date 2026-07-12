import { describe, expect, vi } from 'vitest';
import { GetFlow } from '../../../../src/application/flows/get/GetFlow';
import type { Flow } from '../../../../src/domain/queries/IFlowReadRepository';

describe('GetFlow', () => {
  test('should return flow from repository', async () => {
    const mockFlow: Flow = {
      flowId: 'f1',
      instanceId: 'i1',
      name: 'F1',
      version: 1,
      start: 's',
      nodes: {},
      isActive: true,
    };
    const mockRepo = {
      findById: vi.fn().mockResolvedValue(mockFlow),
      findActiveByInstance: vi.fn(),
      findByInstance: vi.fn(),
    };
    const finder = new GetFlow(mockRepo);

    const result = await finder.execute('f1');
    expect(result).toEqual(mockFlow);
    expect(mockRepo.findById).toHaveBeenCalledWith('f1');
  });

  test('should return null when flow not found', async () => {
    const mockRepo = {
      findById: vi.fn().mockResolvedValue(null),
      findActiveByInstance: vi.fn(),
      findByInstance: vi.fn(),
    };
    const finder = new GetFlow(mockRepo);

    const result = await finder.execute('nonexistent');
    expect(result).toBeNull();
  });
});
