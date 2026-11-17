import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Contact, GroupMetadata } from '@whiskeysockets/baileys';

import { WebhookService } from '@apps/backend/http/webhooks/WebhookService';
import { BaileysEventHandlers } from '@modules/instances/application/events/BaileysEventHandlers';
import type { IChatSynchronizer } from '@modules/chats/application/synchronize/IChatSynchronizer';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';
import { Name } from '@modules/instances/domain/Name';
import type { ILogger } from '@shared/domain/Logger';

describe('BaileysEventHandlers', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('forwards chat synchronization events with the owning instance id', async () => {
    // Arrange
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });
    const syncService = { syncChats: vi.fn().mockResolvedValue(undefined), updateChats: vi.fn(), deleteChats: vi.fn() } as unknown as IChatSynchronizer;
    const handlers = new BaileysEventHandlers(instance, syncService, { send: vi.fn() } as unknown as WebhookService, { info: vi.fn(), error: vi.fn() } as unknown as ILogger);
    const chats = [{ chatId: 'chat-1' }] as never[];

    // Act
    await handlers.onChatsUpsert(chats, true);

    // Assert
    expect(syncService.syncChats).toHaveBeenCalledWith(instance.instanceId, chats, true);
  });

  it('maps groups into chat records and forwards contacts to the webhook', async () => {
    // Arrange
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });
    const syncService = { syncChats: vi.fn().mockResolvedValue(undefined) } as unknown as IChatSynchronizer;
    const webhookService = { send: vi.fn().mockResolvedValue(undefined) } as unknown as WebhookService;
    const handlers = new BaileysEventHandlers(instance, syncService, webhookService, { info: vi.fn(), error: vi.fn() } as unknown as ILogger);
    const groups = [{ id: 'group@g.us', subject: 'Team', participants: [{ id: 'user@s.whatsapp.net' }], desc: 'Group' }] as unknown as GroupMetadata[];
    const contacts = [{ id: 'user@s.whatsapp.net', name: 'User' }] as Contact[];

    // Act
    await handlers.onGroupsUpsert(groups);
    await handlers.onContactsUpsert(contacts);

    // Assert
    expect(syncService.syncChats).toHaveBeenCalledWith(instance.instanceId, [expect.objectContaining({ chatId: 'group@g.us', type: 'group', participantCount: 1 })], true);
    expect(webhookService.send).toHaveBeenCalledWith(instance.instanceId, 'contacts.upsert', { contacts });
  });

  it('logs dependency failures without rejecting event callbacks', async () => {
    // Arrange
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });
    const logger = { info: vi.fn(), error: vi.fn() } as unknown as ILogger;
    const handlers = new BaileysEventHandlers(instance, { syncChats: vi.fn().mockRejectedValue(new Error('sync failed')) } as unknown as IChatSynchronizer, { send: vi.fn() } as unknown as WebhookService, logger);

    // Act
    await handlers.onChatsUpsert([], false);

    // Assert
    expect(logger.error).toHaveBeenCalledWith('Error syncing chats', expect.any(Error));
  });
});
