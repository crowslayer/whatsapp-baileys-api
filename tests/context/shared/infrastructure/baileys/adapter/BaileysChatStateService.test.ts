import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WASocket } from '@whiskeysockets/baileys';

import { BaileysChatStateService } from '@shared/infrastructure/baileys/adapter/BaileysChatStateService';

describe('BaileysChatStateService', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('sends archive and read modifications for valid chats', async () => {
    // Arrange
    const socket = { chatModify: vi.fn().mockResolvedValue(undefined) } as unknown as WASocket;
    const service = new BaileysChatStateService(socket);
    const message = { chatId: '1@s.whatsapp.net', id: 'message-1', fromMe: false, timestamp: 1 };

    // Act
    await service.archiveChat('1@s.whatsapp.net', true);
    await service.markChatRead('1@s.whatsapp.net', [message], true);

    // Assert
    expect(socket.chatModify).toHaveBeenNthCalledWith(1, { archive: true, lastMessages: [] }, '1@s.whatsapp.net');
    expect(socket.chatModify).toHaveBeenNthCalledWith(2, expect.objectContaining({ markRead: true, lastMessages: [expect.objectContaining({ key: expect.objectContaining({ id: 'message-1' }) })] }), '1@s.whatsapp.net');
  });
});
