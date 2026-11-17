import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MongoMessageRepository } from '@modules/messages/infrastructure/persistence/mongo/MongoMessageRepository';
import { MessageModel } from '@modules/messages/infrastructure/persistence/mongo/MessageModel';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { MessageId } from '@modules/messages/domain/MessageId';

describe('MongoMessageRepository', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('skips insertion for an empty message batch', async () => {
    // Arrange
    const insertMany = vi.spyOn(MessageModel, 'insertMany');
    const repository = new MongoMessageRepository();

    // Act
    await repository.saveMany([]);

    // Assert
    expect(insertMany).not.toHaveBeenCalled();
  });

  it('updates a message status using instance and message identifiers', async () => {
    // Arrange
    const updateOne = vi.spyOn(MessageModel, 'updateOne').mockResolvedValue({ modifiedCount: 1 } as never);
    const repository = new MongoMessageRepository();
    const instanceId = InstanceId.fromString('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f');
    const messageId = MessageId.fromString('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e30');

    // Act
    await repository.updateStatus(instanceId, messageId, 'read');

    // Assert
    expect(updateOne).toHaveBeenCalledWith({ instanceId, messageId }, { $set: { status: 'read' } });
  });
});
