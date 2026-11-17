import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NodesEraser } from '@modules/flows/application/nodes/delete/NodesEraser';
import type { IFlowRepository } from '@modules/flows/domain/IFlowRepository';

describe('NodesEraser', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('resets the requested flow nodes and persists the aggregate', async () => {
    // Arrange
    const aggregate = { resetNodes: vi.fn() };
    const repository: IFlowRepository = {
      findById: vi.fn().mockResolvedValue(aggregate),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    // Act
    await new NodesEraser(repository).execute('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e1f');

    // Assert
    expect(aggregate.resetNodes).toHaveBeenCalledOnce();
    expect(repository.save).toHaveBeenCalledWith(aggregate);
  });
});
