import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MongoMessageReadRepository } from '@modules/messages/infrastructure/persistence/mongo/MongoMessageReadRepository';
import { MessageModel, type IMessageDocument } from '@modules/messages/infrastructure/persistence/mongo/MessageModel';

describe('MongoMessageReadRepository', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns a page and cursor when more messages are available', async () => {
    // Arrange
    const docs = [
      { messageId: 'm2', instanceId: 'i1', chatId: 'c1', senderId: 's', direction: 'incoming', timestamp: new Date(2), content: { messageType: 'text', text: 'two' }, createdAt: new Date(2), updatedAt: new Date(2) },
      { messageId: 'm1', instanceId: 'i1', chatId: 'c1', senderId: 's', direction: 'incoming', timestamp: new Date(1), content: { messageType: 'text', text: 'one' }, createdAt: new Date(1), updatedAt: new Date(1) },
    ] as unknown as IMessageDocument[];
    const exec = vi.fn().mockResolvedValue(docs);
    const lean = vi.fn().mockReturnValue({ exec });
    const limit = vi.fn().mockReturnValue({ lean });
    const sort = vi.fn().mockReturnValue({ limit });
    vi.spyOn(MessageModel, 'find').mockReturnValue({ sort } as never);
    const repository = new MongoMessageReadRepository();

    // Act
    const page = await repository.findByChat('i1', 'c1', 1);

    // Assert
    expect(MessageModel.find).toHaveBeenCalledWith({ instanceId: 'i1', chatId: 'c1' });
    expect(page.items).toHaveLength(1);
    expect(page.nextCursor).toEqual({ timestamp: new Date(2), messageId: 'm2' });
  });

  it('returns a null result when the message is absent', async () => {
    // Arrange
    const exec = vi.fn().mockResolvedValue(null);
    const lean = vi.fn().mockReturnValue({ exec });
    vi.spyOn(MessageModel, 'findOne').mockReturnValue({ lean } as never);
    const repository = new MongoMessageReadRepository();

    // Act
    const result = await repository.findById('i1', 'missing');

    // Assert
    expect(result).toBeNull();
  });
});
