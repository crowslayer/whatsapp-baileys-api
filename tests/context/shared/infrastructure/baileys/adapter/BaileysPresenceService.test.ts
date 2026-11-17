import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WASocket } from '@whiskeysockets/baileys';

import { BaileysPresenceService } from '@shared/infrastructure/baileys/adapter/BaileysPresenceService';

describe('BaileysPresenceService', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('subscribes to presence and sends an update for valid JIDs', async () => {
    // Arrange
    const socket = { presenceSubscribe: vi.fn().mockResolvedValue(undefined), sendPresenceUpdate: vi.fn().mockResolvedValue(undefined) } as unknown as WASocket;
    const service = new BaileysPresenceService(socket);

    // Act
    await service.subscribePresence('123@s.whatsapp.net');
    await service.sendPresence('group@g.us', 'composing');

    // Assert
    expect(socket.presenceSubscribe).toHaveBeenCalledWith('123@s.whatsapp.net');
    expect(socket.sendPresenceUpdate).toHaveBeenCalledWith('composing', 'group@g.us');
  });

  it('rejects invalid JIDs with a connection error', async () => {
    // Arrange
    const socket = { presenceSubscribe: vi.fn(), sendPresenceUpdate: vi.fn() } as unknown as WASocket;
    const service = new BaileysPresenceService(socket);

    // Act & Assert
    await expect(service.subscribePresence('invalid')).rejects.toThrow('Failed to subscribe to presence');
    await expect(service.sendPresence('invalid', 'paused')).rejects.toThrow('Failed to update presence');
    expect(socket.presenceSubscribe).not.toHaveBeenCalled();
    expect(socket.sendPresenceUpdate).not.toHaveBeenCalled();
  });
});
