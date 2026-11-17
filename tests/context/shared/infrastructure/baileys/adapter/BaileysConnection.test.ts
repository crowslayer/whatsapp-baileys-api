import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mocks } = vi.hoisted(() => {
  const socket = {
    authState: { creds: { registered: true }, keys: {} },
    requestPairingCode: vi.fn().mockResolvedValue('123456'),
    ev: { on: vi.fn() },
    user: { id: '5215555555555:1@s.whatsapp.net' },
    end: vi.fn().mockResolvedValue(undefined),
  };
  const makeSocket = vi.fn(() => socket);
  const logger = { warn: vi.fn(), error: vi.fn(), info: vi.fn() };
  return {
    mocks: {
      socket,
      makeSocket,
      logger,
      useAuth: vi.fn().mockResolvedValue({ state: { creds: { registered: true }, keys: {} }, saveCreds: vi.fn() }),
      latestVersion: vi.fn().mockResolvedValue({ version: [1, 2, 3] }),
      makeSignalStore: vi.fn().mockReturnValue({}),
      toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,qr'),
      emit: vi.fn(),
    },
  };
});

vi.mock('@whiskeysockets/baileys', () => ({
  default: mocks.makeSocket,
  fetchLatestBaileysVersion: mocks.latestVersion,
  makeCacheableSignalKeyStore: mocks.makeSignalStore,
  useMultiFileAuthState: mocks.useAuth,
  isJidBroadcast: vi.fn().mockReturnValue(false),
  DisconnectReason: { loggedOut: 401, badSession: 500, multideviceMismatch: 411 },
}));
vi.mock('pino', () => ({ default: vi.fn(() => mocks.logger) }));
vi.mock('qrcode', () => ({ default: { toDataURL: mocks.toDataURL } }));
vi.mock('node:fs/promises', () => ({ rm: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@hapi/boom', () => ({ Boom: class { output = { statusCode: 0 }; constructor(_message: string) {} } }));
vi.mock('@cacheable/node-cache', () => ({ default: class { get() { return undefined; } set() {} del() {} } }));

import { BaileysConnection } from '@shared/infrastructure/baileys/adapter/BaileysConnection';
import type { IConnectionEventBus } from '@modules/instances/domain/IConnectionEventBus';

describe('BaileysConnection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.socket.authState.creds.registered = true;
  });
  afterEach(() => vi.restoreAllMocks());

  it('initializes the socket and exposes it after connecting', async () => {
    // Arrange
    const connection = new BaileysConnection('instance-1', { emit: mocks.emit } as unknown as IConnectionEventBus);

    // Act
    await connection.connect();

    // Assert
    expect(mocks.useAuth).toHaveBeenCalledOnce();
    expect(mocks.latestVersion).toHaveBeenCalledOnce();
    expect(connection.getSocket()).toBe(mocks.socket);
  });

  it('requests and publishes a pairing code when requested for an unregistered socket', async () => {
    // Arrange
    mocks.socket.authState.creds.registered = false;
    const connection = new BaileysConnection('instance-2', { emit: mocks.emit } as unknown as IConnectionEventBus);

    // Act
    await connection.connect('5215555555555');

    // Assert
    expect(mocks.socket.requestPairingCode).toHaveBeenCalledWith('5215555555555');
    expect(mocks.emit).toHaveBeenCalledWith('pairingCode', { instanceId: 'instance-2', pairingCode: '123456' });
  });

  it('throws when the socket has not been initialized', () => {
    // Arrange
    const connection = new BaileysConnection('instance-3', { emit: mocks.emit } as unknown as IConnectionEventBus);

    // Act & Assert
    expect(() => connection.getSocket()).toThrow('Socket not initialized');
  });
});
