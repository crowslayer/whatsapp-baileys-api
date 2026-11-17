import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MongoFlowReadRepository } from '@modules/flows/infrastructure/persistence/mongo/MongoFlowReadRepository';
import { FlowModel } from '@modules/flows/infrastructure/persistence/mongo/FlowModel';

describe('MongoFlowReadRepository', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns active flows for an instance', async () => {
    // Arrange
    const flows = [{ flowId: 'flow-1', instanceId: 'instance-1', isActive: true }];
    const exec = vi.fn().mockResolvedValue(flows);
    const lean = vi.fn().mockReturnValue({ exec });
    vi.spyOn(FlowModel, 'find').mockReturnValue({ lean } as never);
    const repository = new MongoFlowReadRepository();

    // Act
    const result = await repository.findActiveByInstance('instance-1');

    // Assert
    expect(FlowModel.find).toHaveBeenCalledWith({ instanceId: 'instance-1', isActive: true });
    expect(result).toEqual(flows);
  });

  it('normalizes a missing flow id to null', async () => {
    // Arrange
    const exec = vi.fn().mockResolvedValue(null);
    const lean = vi.fn().mockReturnValue({ exec });
    vi.spyOn(FlowModel, 'findOne').mockReturnValue({ lean } as never);
    const repository = new MongoFlowReadRepository();

    // Act
    const result = await repository.findById('missing');

    // Assert
    expect(result).toBeNull();
  });
});
