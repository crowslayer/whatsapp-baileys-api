import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WASocket } from '@whiskeysockets/baileys';

import { BaileysEventRouter } from '@shared/infrastructure/baileys/adapter/BaileysEventRouter';
import type { IBaileysEventHandlers } from '@modules/instances/application/events/IBaileysEventHandlers';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';
import { Name } from '@modules/instances/domain/Name';
import type { IEventBus } from '@shared/domain/event/IEventBus';

describe('BaileysEventRouter', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('maps chat events and forwards updates to their handlers', async () => {
    // Arrange
    let dispatch: ((events: never) => Promise<void>) | undefined;
    const socket = { ev: { process: vi.fn((handler: (events: never) => Promise<void>) => { dispatch = handler; }) } } as unknown as WASocket;
    const handlers = {
      onChatsUpsert: vi.fn().mockResolvedValue(undefined),
      onChatsUpdate: vi.fn().mockResolvedValue(undefined),
      onChatsDelete: vi.fn().mockResolvedValue(undefined),
      onContactsUpsert: vi.fn().mockResolvedValue(undefined),
    } as unknown as IBaileysEventHandlers;
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });
    const router = new BaileysEventRouter(socket, instance, handlers, { publish: vi.fn() } as unknown as IEventBus);
    router.bind();

    // Act
    await dispatch?.({
      'chats.upsert': [{ id: '1@s.whatsapp.net', name: 'Alice', unreadCount: 2 }],
      'chats.update': [{ id: '1@s.whatsapp.net', archived: true }],
      'chats.delete': ['2@s.whatsapp.net'],
      'contacts.upsert': [{ id: '1@s.whatsapp.net' }],
    } as never);

    // Assert
    expect(handlers.onChatsUpsert).toHaveBeenCalledWith(
      [expect.objectContaining({ chatId: '1@s.whatsapp.net', instanceId: instance.instanceId, name: 'Alice', unreadCount: 2 })],
      false
    );
    expect(handlers.onChatsUpdate).toHaveBeenCalledWith([expect.objectContaining({ chatId: '1@s.whatsapp.net', isArchived: true })]);
    expect(handlers.onChatsDelete).toHaveBeenCalledWith(['2@s.whatsapp.net']);
    expect(handlers.onContactsUpsert).toHaveBeenCalledOnce();
  });

  it('ignores chat records that do not have an id', async () => {
    // Arrange
    let dispatch: ((events: never) => Promise<void>) | undefined;
    const socket = { ev: { process: vi.fn((handler: (events: never) => Promise<void>) => { dispatch = handler; }) } } as unknown as WASocket;
    const handlers = { onChatsUpsert: vi.fn() } as unknown as IBaileysEventHandlers;
    const router = new BaileysEventRouter(socket, InstanceAggregate.create({ name: Name.create('Primary') }), handlers, { publish: vi.fn() } as unknown as IEventBus);
    router.bind();

    // Act
    await dispatch?.({ 'chats.upsert': [{ name: 'No id' }] } as never);

    // Assert
    expect(handlers.onChatsUpsert).not.toHaveBeenCalled();
  });
});
