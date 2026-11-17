import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MongoFlowRepository } from '@modules/flows/infrastructure/persistence/mongo/MongoFlowRepository';
import { FlowModel } from '@modules/flows/infrastructure/persistence/mongo/FlowModel';
import { FlowId } from '@modules/flows/domain/FlowId';

describe('MongoFlowRepository', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('deletes a flow by its identifier', async () => {
    // Arrange
    const exec = vi.fn().mockResolvedValue({ deletedCount: 1 });
    vi.spyOn(FlowModel, 'deleteOne').mockReturnValue({ exec } as never);
    const repository = new MongoFlowRepository();
    const id = FlowId.fromString('9c858901-8a57-4791-81fe-4c455b099bc9');

    // Act
    await repository.delete(id);

    // Assert
    expect(FlowModel.deleteOne).toHaveBeenCalledWith({ flowId: id.value });
    expect(exec).toHaveBeenCalledOnce();
  });
});
