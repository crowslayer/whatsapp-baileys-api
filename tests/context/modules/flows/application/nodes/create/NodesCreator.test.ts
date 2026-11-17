import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NodesCreator } from '@modules/flows/application/nodes/create/NodesCreator';
import type { IFlowRepository } from '@modules/flows/domain/IFlowRepository';

const FLOW_ID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e1f';

describe('NodesCreator', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('updates a flow with nodes and triggers and saves it', async () => {
    // Arrange
    const aggregate = { updateNodes: vi.fn(), addTriggers: vi.fn() };
    const repository: IFlowRepository = {
      findById: vi.fn().mockResolvedValue(aggregate),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    const nodes = { start: { id: 'start', type: 'message' as const, text: 'Hello', next: null } };
    const triggers = [{ type: 'keyword' as const, value: 'hello' }];

    // Act
    await new NodesCreator(repository).execute({ flowId: FLOW_ID, nodes, start: 'start', triggers });

    // Assert
    expect(aggregate.updateNodes).toHaveBeenCalledWith(nodes, 'start');
    expect(aggregate.addTriggers).toHaveBeenCalledWith(triggers);
    expect(repository.save).toHaveBeenCalledWith(aggregate);
  });

  it('wraps errors thrown while loading or updating the flow', async () => {
    // Arrange
    const repository: IFlowRepository = {
      findById: vi.fn().mockRejectedValue(new Error('missing flow')),
      save: vi.fn(), delete: vi.fn(),
    };

    // Act / Assert
    await expect(new NodesCreator(repository).execute({
      flowId: FLOW_ID, nodes: {}, start: '', triggers: [],
    })).rejects.toThrow('Error creating nodes');
  });
});
