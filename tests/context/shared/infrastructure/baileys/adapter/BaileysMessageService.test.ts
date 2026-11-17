import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WASocket, WAMessage } from '@whiskeysockets/baileys';

import { BaileysMessageService } from '@shared/infrastructure/baileys/adapter/BaileysMessageService';

describe('BaileysMessageService', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('sends text and maps the Baileys response to a sent message', async () => {
    // Arrange
    const sent = { key: { id: 'message-1', remoteJid: '1@s.whatsapp.net' }, messageTimestamp: 1 } as WAMessage;
    const socket = { sendMessage: vi.fn().mockResolvedValue(sent), user: { id: 'bot:device@s.whatsapp.net' } } as unknown as WASocket;
    const service = new BaileysMessageService(socket);

    // Act
    const result = await service.sendText('1@s.whatsapp.net', 'hello');

    // Assert
    expect(socket.sendMessage).toHaveBeenCalledWith('1@s.whatsapp.net', { text: 'hello' }, undefined);
    expect(result).toMatchObject({ messageId: 'message-1', chatId: '1@s.whatsapp.net', senderId: 'bot:device@s.whatsapp.net', content: { messageType: 'text', text: 'hello' } });
  });

  it('rejects an invalid destination before sending', async () => {
    // Arrange
    const socket = { sendMessage: vi.fn() } as unknown as WASocket;
    const service = new BaileysMessageService(socket);

    // Act & Assert
    await expect(service.sendText('invalid', 'hello')).rejects.toThrow('Invalid JID');
    expect(socket.sendMessage).not.toHaveBeenCalled();
  });
});
