import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ConnectionEventsSubscriber } from '@modules/instances/application/events/subscribers/ConnectionEventsSubscriber';
import type { ConnectionEvents, IConnectionEventBus } from '@modules/instances/domain/IConnectionEventBus';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import type { IConnectionStateStore } from '@modules/instances/application/runtime/IConnectionStateStore';
import type { IEventBus } from '@shared/domain/event/IEventBus';

describe('ConnectionEventsSubscriber', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('registers callbacks and updates a found instance on connection', async () => {
    // Arrange
    const callbacks: Partial<Record<keyof ConnectionEvents, (data: unknown) => void>> = {};
    const eventBus = {
      on: vi.fn((event: keyof ConnectionEvents, handler: (data: never) => void) => {
        callbacks[event] = handler as (data: unknown) => void;
      }),
    } as unknown as IConnectionEventBus;
    const instance = { connect: vi.fn() };
    const repository = {
      findById: vi.fn().mockResolvedValue(instance),
      update: vi.fn().mockResolvedValue(undefined),
    } as unknown as IInstanceRepository;
    const connectionStore = { clear: vi.fn().mockResolvedValue(undefined), setPairingCode: vi.fn() } as unknown as IConnectionStateStore;
    const domainEventBus = { publish: vi.fn().mockResolvedValue(undefined) } as unknown as IEventBus;
    const subscriber = new ConnectionEventsSubscriber(eventBus, repository, connectionStore, domainEventBus);

    // Act
    subscriber.subscribe();
    await (callbacks.connected as (data: ConnectionEvents['connected']) => Promise<void>)({ instanceId: '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', phone: '5215555555555' });

    // Assert
    expect(eventBus.on).toHaveBeenCalledTimes(4);
    expect(instance.connect).toHaveBeenCalledWith('5215555555555');
    expect(repository.update).toHaveBeenCalledWith(instance);
    expect(connectionStore.clear).toHaveBeenCalledOnce();
  });

  it('publishes QR events and stores pairing codes', async () => {
    // Arrange
    const callbacks: Partial<Record<keyof ConnectionEvents, (data: unknown) => void>> = {};
    const eventBus = { on: vi.fn((event: keyof ConnectionEvents, handler: (data: never) => void) => { callbacks[event] = handler as (data: unknown) => void; }) } as unknown as IConnectionEventBus;
    const connectionStore = { setPairingCode: vi.fn().mockResolvedValue(undefined) } as unknown as IConnectionStateStore;
    const domainEventBus = { publish: vi.fn().mockResolvedValue(undefined) } as unknown as IEventBus;
    const subscriber = new ConnectionEventsSubscriber(eventBus, {} as IInstanceRepository, connectionStore, domainEventBus);
    subscriber.subscribe();

    // Act
    await (callbacks.qr as (data: ConnectionEvents['qr']) => Promise<void>)({ instanceId: 'instance-1', qrCode: 'image', qrText: 'scan' });
    await (callbacks.pairingCode as (data: ConnectionEvents['pairingCode']) => Promise<void>)({ instanceId: 'instance-1', pairingCode: '123456' });

    // Assert
    expect(domainEventBus.publish).toHaveBeenCalledOnce();
    expect(connectionStore.setPairingCode).toHaveBeenCalledWith('instance-1', '123456');
  });
});
