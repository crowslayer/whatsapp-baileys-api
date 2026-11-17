import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WASocket } from '@whiskeysockets/baileys';

import { BaileysGroupsService } from '@shared/infrastructure/baileys/adapter/BaileysGroupsService';

describe('BaileysGroupsService', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('delegates group management operations to the socket', async () => {
    // Arrange
    const socket = {
      groupCreate: vi.fn().mockResolvedValue({ id: 'group@g.us' }),
      groupParticipantsUpdate: vi.fn().mockResolvedValue(undefined),
      groupUpdateSubject: vi.fn().mockResolvedValue(undefined),
      groupInviteCode: vi.fn().mockResolvedValue('invite'),
    } as unknown as WASocket;
    const service = new BaileysGroupsService(socket);

    // Act
    const created = await service.createGroup('Team', ['1@s.whatsapp.net']);
    await service.addParticipantsToGroup('group@g.us', ['2@s.whatsapp.net']);
    await service.updateGroupSubject('group@g.us', 'Updated');
    const link = await service.getGroupInviteLink('group@g.us');

    // Assert
    expect(created).toBe('group@g.us');
    expect(socket.groupParticipantsUpdate).toHaveBeenCalledWith('group@g.us', ['2@s.whatsapp.net'], 'add');
    expect(socket.groupUpdateSubject).toHaveBeenCalledWith('group@g.us', 'Updated');
    expect(link).toBe('invite');
  });

  it('rejects invalid group ids before calling the socket', async () => {
    // Arrange
    const socket = { groupLeave: vi.fn() } as unknown as WASocket;
    const service = new BaileysGroupsService(socket);

    // Act & Assert
    await expect(service.leaveGroup('invalid')).rejects.toThrow('Failed to leave group');
    expect(socket.groupLeave).not.toHaveBeenCalled();
  });
});
