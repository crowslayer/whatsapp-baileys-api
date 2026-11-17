import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { runtimeMocks } = vi.hoisted(() => ({
  runtimeMocks: {
    connection: { connect: vi.fn().mockResolvedValue(undefined), getSocket: vi.fn().mockReturnValue({}), disconnect: vi.fn().mockResolvedValue(undefined) },
    messaging: { sendText: vi.fn() }, groups: { createGroup: vi.fn() }, presence: { sendPresence: vi.fn() },
    profile: { getStatus: vi.fn() }, privacy: { fetchBlocklist: vi.fn() }, chatState: { archiveChat: vi.fn() },
    bind: vi.fn(),
  },
}));

vi.mock('@shared/infrastructure/baileys/adapter/BaileysConnection', () => ({ BaileysConnection: vi.fn(function () { return runtimeMocks.connection; }) }));
vi.mock('@shared/infrastructure/baileys/adapter/BaileysMessageService', () => ({ BaileysMessageService: vi.fn(function () { return runtimeMocks.messaging; }) }));
vi.mock('@shared/infrastructure/baileys/adapter/BaileysGroupsService', () => ({ BaileysGroupsService: vi.fn(function () { return runtimeMocks.groups; }) }));
vi.mock('@shared/infrastructure/baileys/adapter/BaileysPresenceService', () => ({ BaileysPresenceService: vi.fn(function () { return runtimeMocks.presence; }) }));
vi.mock('@shared/infrastructure/baileys/adapter/BaileysProfileService', () => ({ BaileysProfileService: vi.fn(function () { return runtimeMocks.profile; }) }));
vi.mock('@shared/infrastructure/baileys/adapter/BaileysPrivacyService', () => ({ BaileysPrivacyService: vi.fn(function () { return runtimeMocks.privacy; }) }));
vi.mock('@shared/infrastructure/baileys/adapter/BaileysChatStateService', () => ({ BaileysChatStateService: vi.fn(function () { return runtimeMocks.chatState; }) }));
vi.mock('@shared/infrastructure/baileys/adapter/BaileysEventRouter', () => ({ BaileysEventRouter: vi.fn(function () { return { bind: runtimeMocks.bind }; }) }));

import { WhatsAppInstanceRuntime } from '@modules/instances/application/runtime/WhatsAppInstanceRuntime';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';
import { Name } from '@modules/instances/domain/Name';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import type { IBaileysEventHandlers } from '@modules/instances/application/events/IBaileysEventHandlers';
import type { IConnectionEventBus, ConnectionEvents } from '@modules/instances/domain/IConnectionEventBus';
import type { IConnectionStateStore } from '@modules/instances/application/runtime/IConnectionStateStore';
import type { IEventBus } from '@shared/domain/event/IEventBus';

describe('WhatsAppInstanceRuntime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runtimeMocks.connection.connect.mockResolvedValue(undefined);
  });
  afterEach(() => vi.restoreAllMocks());

  it('starts services, binds events and stops the underlying connection', async () => {
    // Arrange
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });
    const runtime = new WhatsAppInstanceRuntime(
      instance,
      { update: vi.fn() } as unknown as IInstanceRepository,
      {} as IBaileysEventHandlers,
      { clear: vi.fn() } as unknown as IConnectionStateStore,
      { on: vi.fn() } as unknown as IConnectionEventBus,
      { publish: vi.fn() } as unknown as IEventBus
    );

    // Act
    await runtime.start('5215555555555');
    await runtime.stop();

    // Assert
    expect(runtimeMocks.connection.connect).toHaveBeenCalledWith('5215555555555');
    expect(runtime.messaging).toBe(runtimeMocks.messaging);
    expect(runtime.groups).toBe(runtimeMocks.groups);
    expect(runtimeMocks.bind).toHaveBeenCalledOnce();
    expect(runtimeMocks.connection.disconnect).toHaveBeenCalledOnce();
  });

  it('persists matching connection events and notifies disconnect listeners', async () => {
    // Arrange
    const callbacks: Partial<Record<keyof ConnectionEvents, (data: unknown) => void>> = {};
    const connectionBus = { on: vi.fn((event: keyof ConnectionEvents, handler: (data: never) => void) => { callbacks[event] = handler as (data: unknown) => void; }) } as unknown as IConnectionEventBus;
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });
    const repository = { update: vi.fn().mockResolvedValue(undefined) } as unknown as IInstanceRepository;
    const connectionStore = { clear: vi.fn().mockResolvedValue(undefined) } as unknown as IConnectionStateStore;
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) } as unknown as IEventBus;
    const runtime = new WhatsAppInstanceRuntime(instance, repository, {} as IBaileysEventHandlers, connectionStore, connectionBus, eventBus);
    const disconnected = vi.fn();
    runtime.onDisconnect(disconnected);

    // Act
    await runtime.start();
    await (callbacks.connected as (data: ConnectionEvents['connected']) => Promise<void>)({ instanceId: instance.instanceId, phone: '5215555555555' });
    await (callbacks.disconnected as (data: ConnectionEvents['disconnected']) => Promise<void>)({ instanceId: instance.instanceId, type: 'TRANSIENT', reason: 'network' });

    // Assert
    expect(repository.update).toHaveBeenCalledTimes(2);
    expect(connectionStore.clear).toHaveBeenCalledWith(instance.instanceId);
    expect(disconnected).toHaveBeenCalledWith({ instanceId: instance.instanceId, type: 'TRANSIENT', reason: 'network' });
  });
});
