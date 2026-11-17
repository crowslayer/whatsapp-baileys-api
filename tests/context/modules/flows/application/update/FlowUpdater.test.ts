import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FlowUpdater } from '@modules/flows/application/update/FlowUpdater';
import type { IFlowRepository } from '@modules/flows/domain/IFlowRepository';

const FLOW_ID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e1f';
const INSTANCE_ID = '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f';

describe('FlowUpdater', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('loads a flow, applies the new instance and name, then saves it', async () => {
    // Arrange
    const aggregate = { changeInstance: vi.fn(), rename: vi.fn() };
    const repository: IFlowRepository = {
      findById: vi.fn().mockResolvedValue(aggregate),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    const updater = new FlowUpdater(repository);

    // Act
    await updater.execute({ flowId: FLOW_ID, instanceId: INSTANCE_ID, name: 'Updated flow' });

    // Assert
    expect(repository.findById).toHaveBeenCalledWith(expect.objectContaining({ value: FLOW_ID }));
    expect(aggregate.changeInstance).toHaveBeenCalledWith(expect.objectContaining({ value: INSTANCE_ID }));
    expect(aggregate.rename).toHaveBeenCalledWith(expect.objectContaining({ value: 'Updated flow' }));
    expect(repository.save).toHaveBeenCalledWith(aggregate);
  });

  it('propagates repository failures', async () => {
    // Arrange
    const repository: IFlowRepository = {
      findById: vi.fn().mockRejectedValue(new Error('database unavailable')),
      save: vi.fn(), delete: vi.fn(),
    };

    // Act / Assert
    await expect(new FlowUpdater(repository).execute({
      flowId: FLOW_ID, instanceId: INSTANCE_ID, name: 'Updated flow',
    })).rejects.toThrow('database unavailable');
  });
});
