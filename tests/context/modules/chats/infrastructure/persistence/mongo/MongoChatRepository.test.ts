import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MongoChatRepository } from '@modules/chats/infrastructure/persistence/mongo/MongoChatRepository';
import { ChatModel } from '@modules/chats/infrastructure/persistence/mongo/ChatModel';

describe('MongoChatRepository', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('skips bulk upsert for an empty batch', async () => {
    // Arrange
    const bulkWrite = vi.spyOn(ChatModel, 'bulkWrite');
    const repository = new MongoChatRepository();

    // Act
    await repository.upsertMany([]);

    // Assert
    expect(bulkWrite).not.toHaveBeenCalled();
  });

  it('deletes all chats for an instance', async () => {
    // Arrange
    const deleteMany = vi.spyOn(ChatModel, 'deleteMany').mockResolvedValue({ deletedCount: 2 } as never);
    const repository = new MongoChatRepository();

    // Act
    await repository.deleteByInstance('instance-1');

    // Assert
    expect(deleteMany).toHaveBeenCalledWith({ instanceId: 'instance-1' });
  });
});
