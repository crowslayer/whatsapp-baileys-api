import { describe, expect, vi } from 'vitest';
import { FlowEraser } from '../../../../src/application/flows/delete/FlowEraser';
import { FlowId } from '../../../../src/domain/value-objects/FlowId';

describe('FlowEraser', () => {
  test('should deactivate flow and save', async () => {
    const mockAggregate = { deactivate: vi.fn() };
    const mockRepo = { findById: vi.fn().mockResolvedValue(mockAggregate), save: vi.fn() };
    const eraser = new FlowEraser(mockRepo);
    const flowId = FlowId.fromString('flow-1');

    await eraser.execute(flowId);

    expect(mockRepo.findById).toHaveBeenCalledWith(flowId);
    expect(mockAggregate.deactivate).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledWith(mockAggregate);
  });

  test('should throw when repository fails', async () => {
    const mockRepo = { findById: vi.fn().mockRejectedValue(new Error('not found')), save: vi.fn() };
    const eraser = new FlowEraser(mockRepo);
    const flowId = FlowId.fromString('flow-1');

    await expect(eraser.execute(flowId)).rejects.toThrow('not found');
  });
});
