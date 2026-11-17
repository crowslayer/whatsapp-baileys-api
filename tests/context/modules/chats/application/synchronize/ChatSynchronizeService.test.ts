import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatSynchronizeService } from '@modules/chats/application/synchronize/ChatSynchronizeService';
import type { IChat } from '@modules/chats/domain/IChat';
import type { IChatRepository } from '@modules/chats/domain/IChatRepository';
import type { ILogger } from '@shared/domain/Logger';

describe('ChatSynchronizeService', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('replaces stored chats during a full sync', async () => {
    // Arrange
    const repository = {
      deleteByInstance: vi.fn().mockResolvedValue(undefined),
      saveMany: vi.fn().mockResolvedValue(undefined),
      upsertMany: vi.fn().mockResolvedValue(undefined),
    } as unknown as IChatRepository;
    const logger = { info: vi.fn() } as unknown as ILogger;
    const service = new ChatSynchronizeService(repository, logger);
    const chats: IChat[] = [{ chatId: 'chat-1', instanceId: 'unused', name: 'Alice', type: 'chat', unreadCount: 1, isArchived: false, isMuted: false }];

    // Act
    await service.syncChats('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', chats, true);

    // Assert
    expect(repository.deleteByInstance).toHaveBeenCalledOnce();
    expect(repository.saveMany).toHaveBeenCalledOnce();
    expect(repository.upsertMany).not.toHaveBeenCalled();
  });

  it('skips empty sync and delete batches', async () => {
    // Arrange
    const repository = { deleteByInstance: vi.fn(), saveMany: vi.fn(), upsertMany: vi.fn(), delete: vi.fn() } as unknown as IChatRepository;
    const service = new ChatSynchronizeService(repository, { info: vi.fn() } as unknown as ILogger);

    // Act
    await service.syncChats('instance', [], false);
    await service.deleteChats('instance', []);

    // Assert
    expect(repository.upsertMany).not.toHaveBeenCalled();
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
