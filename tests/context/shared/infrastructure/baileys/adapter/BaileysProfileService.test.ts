import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WASocket } from '@whiskeysockets/baileys';

import { BaileysProfileService } from '@shared/infrastructure/baileys/adapter/BaileysProfileService';

describe('BaileysProfileService', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns profile data and normalizes WhatsApp number lookup results', async () => {
    // Arrange
    const socket = {
      profilePictureUrl: vi.fn().mockResolvedValue('https://example.test/picture'),
      onWhatsApp: vi.fn().mockResolvedValue([{ jid: '1@s.whatsapp.net', exists: true }]),
    } as unknown as WASocket;
    const service = new BaileysProfileService(socket);

    // Act
    const picture = await service.getProfilePictureUrl('1@s.whatsapp.net');
    const numbers = await service.checkWhatsAppNumber('1@s.whatsapp.net');

    // Assert
    expect(picture).toBe('https://example.test/picture');
    expect(numbers).toEqual([{ jid: '1@s.whatsapp.net', exists: true }]);
  });

  it('returns undefined for a profile picture lookup failure', async () => {
    // Arrange
    const socket = { profilePictureUrl: vi.fn().mockRejectedValue(new Error('offline')) } as unknown as WASocket;
    const service = new BaileysProfileService(socket);

    // Act
    const result = await service.getProfilePictureUrl('1@s.whatsapp.net');

    // Assert
    expect(result).toBeUndefined();
  });
});
