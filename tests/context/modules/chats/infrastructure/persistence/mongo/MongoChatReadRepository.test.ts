import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MongoChatReadRepository } from '@modules/chats/infrastructure/persistence/mongo/MongoChatReadRepository';
import { ChatModel, type IChatDocument } from '@modules/chats/infrastructure/persistence/mongo/ChatModel';

describe('MongoChatReadRepository', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('filters individual chats and maps documents to read models', async () => {
    // Arrange
    const document = { chatId: '1@s.whatsapp.net', instanceId: 'instance-1', name: 'Alice', type: 'chat', unreadCount: 1, isArchived: false, isMuted: false } as IChatDocument;
    const sort = vi.fn().mockResolvedValue([document]);
    vi.spyOn(ChatModel, 'find').mockReturnValue({ sort } as never);
    const repository = new MongoChatReadRepository();

    // Act
    const chats = await repository.findChatsByInstance('instance-1');

    // Assert
    expect(ChatModel.find).toHaveBeenCalledWith({ instanceId: 'instance-1', type: 'chat' });
    expect(chats).toEqual([expect.objectContaining({ chatId: document.chatId, name: 'Alice' })]);
  });

  it('returns false when a chat does not exist', async () => {
    // Arrange
    vi.spyOn(ChatModel, 'countDocuments').mockResolvedValue(0 as never);
    const repository = new MongoChatReadRepository();

    // Act
    const exists = await repository.exists('missing', 'instance-1');

    // Assert
    expect(exists).toBe(false);
  });
});
