import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WAMessage } from '@whiskeysockets/baileys/lib/Types/Message';

import { BaileysMessageMapper } from '@shared/infrastructure/baileys/mappers/BaileysMessageMapper';

describe('BaileysMessageMapper', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('maps an incoming text message and its sender metadata', () => {
    // Arrange
    const message = {
      key: { id: 'message-1', remoteJid: 'user@s.whatsapp.net', fromMe: false },
      messageTimestamp: 1_735_689_600,
      message: { conversation: 'Hello' },
    } as unknown as WAMessage;

    // Act
    const result = BaileysMessageMapper.toIncomingMessage('instance-1', message);

    // Assert
    expect(result).toEqual({
      instanceId: 'instance-1', chatId: 'user@s.whatsapp.net', messageId: 'message-1',
      senderId: 'user@s.whatsapp.net', timestamp: new Date(1_735_689_600_000),
      content: { messageType: 'text', text: 'Hello', context: undefined },
    });
  });

  it('ignores outgoing messages and unsupported payloads', () => {
    // Arrange
    const outgoing = { key: { fromMe: true }, message: { conversation: 'sent' } } as unknown as WAMessage;
    const unsupported = { key: { fromMe: false }, message: {} } as unknown as WAMessage;

    // Act / Assert
    expect(BaileysMessageMapper.toIncomingMessage('instance-1', outgoing)).toBeNull();
    expect(BaileysMessageMapper.toIncomingMessage('instance-1', unsupported)).toBeNull();
  });
});
