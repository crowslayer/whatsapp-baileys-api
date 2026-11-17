import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WASocket } from '@whiskeysockets/baileys';

import { BaileysPrivacyService } from '@shared/infrastructure/baileys/adapter/BaileysPrivacyService';

describe('BaileysPrivacyService', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('updates block status and privacy settings', async () => {
    // Arrange
    const socket = {
      updateBlockStatus: vi.fn().mockResolvedValue(undefined),
      updateReadReceiptsPrivacy: vi.fn().mockResolvedValue(undefined),
      fetchBlocklist: vi.fn().mockResolvedValue(['blocked@s.whatsapp.net']),
    } as unknown as WASocket;
    const service = new BaileysPrivacyService(socket);

    // Act
    await service.updateBlockStatus('1@s.whatsapp.net', 'block');
    await service.updateReadReceiptsPrivacy('none');
    const blocked = await service.fetchBlocklist();

    // Assert
    expect(socket.updateBlockStatus).toHaveBeenCalledWith('1@s.whatsapp.net', 'block');
    expect(socket.updateReadReceiptsPrivacy).toHaveBeenCalledWith('none');
    expect(blocked).toEqual(['blocked@s.whatsapp.net']);
  });
});
