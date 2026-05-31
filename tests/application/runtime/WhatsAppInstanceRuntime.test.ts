import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  connectMock: vi.fn(),
  disconnectMock: vi.fn(),
  getSocketMock: vi.fn(() => ({})),
  bindMock: vi.fn(),
  publishMock: vi.fn(),
  qrEventCreateMock: vi.fn(() => ({
    eventId: 'event-1',
  })),
}));

vi.mock('@infrastructure/baileys/adapter/BaileysConnection', () => ({
  BaileysConnection: class {
    connect = mocks.connectMock;
    disconnect = mocks.disconnectMock;
    getSocket = mocks.getSocketMock;
  },
}));

vi.mock('@domain/events/QRCodeGeneratedEvent', () => ({
  QRCodeGeneratedEvent: {
    create: mocks.qrEventCreateMock,
  },
}));

vi.mock('@infrastructure/baileys/adapter/BaileysEventRouter', () => ({
  BaileysEventRouter: class {
    bind = mocks.bindMock;
  },
}));

vi.mock('@infrastructure/baileys/adapter/BaileysMessageService', () => ({
  BaileysMessageService: class {},
}));

vi.mock('@infrastructure/baileys/adapter/BaileysGroupsService', () => ({
  BaileysGroupsService: class {},
}));

vi.mock('@infrastructure/baileys/adapter/BaileysPresenceService', () => ({
  BaileysPresenceService: class {},
}));

vi.mock('@infrastructure/baileys/adapter/BaileysProfileService', () => ({
  BaileysProfileService: class {},
}));

vi.mock('@infrastructure/baileys/adapter/BaileysChatStateService', () => ({
  BaileysChatStateService: class {},
}));

vi.mock('@infrastructure/baileys/adapter/BaileysPrivacyService', () => ({
  BaileysPrivacyService: class {},
}));

import { WhatsAppInstanceRuntime } from '../../../src/application/runtime/WhatsAppInstanceRuntime';

describe('WhatsAppInstanceRuntime', () => {
  let listeners: Record<string, Function>;

  let instance: any;
  let repository: any;
  let connectionStore: any;
  let eventBus: any;
  let eventHandlers: any;
  let domainEventBus: any;

  beforeEach(() => {
    vi.clearAllMocks();

    listeners = {};

    instance = {
      instanceId: 'instance-1',
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    repository = {
      update: vi.fn(),
    };

    connectionStore = {
      setQR: vi.fn(),
      clear: vi.fn(),
      setPairingCode: vi.fn(),
    };

    eventBus = {
      on: vi.fn((event: string, callback: Function) => {
        listeners[event] = callback;
      }),
    };

    domainEventBus = {
      publish: mocks.publishMock,
    };

    eventHandlers = {};
  });

  it('should start runtime and initialize services', async () => {
    const runtime = new WhatsAppInstanceRuntime(
      instance,
      repository,
      eventHandlers,
      connectionStore,
      eventBus,
      domainEventBus
    );

    await runtime.start();

    expect(mocks.connectMock).toHaveBeenCalled();
    expect(mocks.bindMock).toHaveBeenCalled();

    expect(runtime.messaging).toBeDefined();
    expect(runtime.groups).toBeDefined();
    expect(runtime.profile).toBeDefined();
    expect(runtime.presence).toBeDefined();
    expect(runtime.privacy).toBeDefined();
    expect(runtime.chatState).toBeDefined();
  });

  it('should stop runtime', async () => {
    const runtime = new WhatsAppInstanceRuntime(
      instance,
      repository,
      eventHandlers,
      connectionStore,
      eventBus,
      domainEventBus
    );

    await runtime.start();
    await runtime.stop();

    expect(mocks.disconnectMock).toHaveBeenCalled();
  });

  it('should handle qr event', async () => {
    const runtime = new WhatsAppInstanceRuntime(
      instance,
      repository,
      eventHandlers,
      connectionStore,
      eventBus,
      domainEventBus
    );

    await runtime.start();

    await listeners.qr({
      instanceId: 'instance-1',
      qrCode: 'qr-code',
      qrText: 'qr-text',
    });

    expect(mocks.qrEventCreateMock).toHaveBeenCalledWith('instance-1', {
      instanceId: 'instance-1',
      qrCode: 'qr-code',
      qrText: 'qr-text',
    });

    expect(mocks.publishMock).toHaveBeenCalledWith([
      {
        eventId: 'event-1',
      },
    ]);
  });

  it('should handle connected event', async () => {
    const runtime = new WhatsAppInstanceRuntime(
      instance,
      repository,
      eventHandlers,
      connectionStore,
      eventBus,
      domainEventBus
    );

    await runtime.start();

    await listeners.connected({
      instanceId: 'instance-1',
      phone: '5219999999999',
    });

    expect(instance.connect).toHaveBeenCalledWith('5219999999999');
    expect(repository.update).toHaveBeenCalledWith(instance);
    expect(connectionStore.clear).toHaveBeenCalledWith('instance-1');
  });

  it('should handle disconnected event', async () => {
    const handler = vi.fn();

    const runtime = new WhatsAppInstanceRuntime(
      instance,
      repository,
      eventHandlers,
      connectionStore,
      eventBus,
      domainEventBus
    );

    runtime.onDisconnect(handler);

    await runtime.start();

    const event = {
      instanceId: 'instance-1',
      reason: 'logout',
      type: 'LOGGED_OUT',
    };

    await listeners.disconnected(event);

    expect(instance.disconnect).toHaveBeenCalledWith('logout');
    expect(repository.update).toHaveBeenCalledWith(instance);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('should handle pairing code event', async () => {
    const runtime = new WhatsAppInstanceRuntime(
      instance,
      repository,
      eventHandlers,
      connectionStore,
      eventBus,
      domainEventBus
    );

    await runtime.start();

    await listeners.pairingCode({
      instanceId: 'instance-1',
      pairingCode: 'ABC123',
    });

    expect(connectionStore.setPairingCode).toHaveBeenCalledWith('instance-1', 'ABC123');
  });

  it('should ignore events from another instance', async () => {
    const runtime = new WhatsAppInstanceRuntime(
      instance,
      repository,
      eventHandlers,
      connectionStore,
      eventBus,
      domainEventBus
    );

    await runtime.start();

    await listeners.connected({
      instanceId: 'another-instance',
      phone: '123456',
    });

    expect(instance.connect).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });
});
