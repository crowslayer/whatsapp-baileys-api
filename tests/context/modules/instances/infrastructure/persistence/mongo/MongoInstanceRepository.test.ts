import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MongoInstanceRepository } from '@modules/instances/infrastructure/persistence/mongo/MongoInstanceRepository';
import { WhatsAppInstanceModel } from '@modules/instances/infrastructure/persistence/mongo/WhatsAppInstanceModel';
import { InstanceId } from '@modules/instances/domain/InstanceId';

describe('MongoInstanceRepository', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('does not issue a delete when the instance does not exist', async () => {
    // Arrange
    vi.spyOn(WhatsAppInstanceModel, 'findOne').mockResolvedValue(null as never);
    const deleteOne = vi.spyOn(WhatsAppInstanceModel, 'deleteOne');
    const repository = new MongoInstanceRepository();
    const id = InstanceId.fromString('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f');

    // Act
    await repository.delete(id);

    // Assert
    expect(WhatsAppInstanceModel.findOne).toHaveBeenCalledWith({ instanceId: id });
    expect(deleteOne).not.toHaveBeenCalled();
  });
});
