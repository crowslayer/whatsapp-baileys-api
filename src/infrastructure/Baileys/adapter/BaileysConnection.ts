import { rm } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import path from 'path';

import NodeCache from '@cacheable/node-cache';
import { Boom } from '@hapi/boom';
import makeWASocket, {
  CacheStore,
  DisconnectReason,
  WASocket,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';

// ===============================
// TYPES
// ===============================

export type DisconnectType = 'TRANSIENT' | 'INVALID_SESSION' | 'LOGGED_OUT';

export interface IBaileysConnectionEvents {
  onQR?: (qrBase64: string, qrText: string) => void;
  onConnected?: (phone: string) => void;
  onDisconnected?: (event: { type: DisconnectType; reason?: string }) => void;
  onPairingCode?: (code: string) => void;
}

// ===============================
// CLASS
// ===============================
const date = new Date();
const trasport = {
  transport: {
    targets: [
      {
        target: 'pino/file',
        level: 'trace',
        options: {
          destination: `./logs/bayileys/logs/baileys.connection-${'trace'}-${date.toJSON().slice(0, 10)}.log`,
          mkdir: true,
        },
      },
    ],
  },
};
export class BaileysConnection {
  private _socket?: WASocket;
  private _logger = pino({ level: 'info', ...trasport });
  private _intentionalClose = false;

  private _msgRetryCounterCache = new NodeCache({
    stdTTL: 3600,
    checkperiod: 600,
  }) as CacheStore;

  private _isConnecting = false;

  constructor(
    private readonly instanceId: string,
    private readonly events: IBaileysConnectionEvents
    // private readonly eventBus: IConnectionEventBus
  ) {}

  // ===============================
  // AUTH PATH
  // ===============================
  private getAuthPath(): string {
    const safeId = this.instanceId.replace(/[^a-zA-Z0-9-_]/g, '');
    return path.join(process.cwd(), 'sessions', safeId);
  }

  // ===============================
  // CONNECT
  // ===============================
  async connect(phoneNumber?: string): Promise<void> {
    if (this._isConnecting) return;
    this._isConnecting = true;

    const { state, saveCreds } = await useMultiFileAuthState(this.getAuthPath());

    const { version } = await fetchLatestBaileysVersion();

    this._socket = makeWASocket({
      version,
      logger: this._logger,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, this._logger),
      },
      browser: ['WhatsApp API', 'Chrome', '4.0.0'],
      markOnlineOnConnect: false,
      syncFullHistory: false,
      msgRetryCounterCache: this._msgRetryCounterCache,
    });

    // ===============================
    // PAIRING CODE
    // ===============================
    if (!this._socket.authState.creds.registered && phoneNumber) {
      const code = await this._socket.requestPairingCode(phoneNumber);
      this.events.onPairingCode?.(code);
    }

    // ===============================
    // SAVE CREDS
    // ===============================
    this._socket.ev.on('creds.update', saveCreds);

    // ===============================
    // CONNECTION EVENTS
    // ===============================
    this._socket.ev.on('connection.update', async (update) => {
      const { connection, qr, lastDisconnect } = update;

      // QR
      if (qr) {
        const qrCodeBase64 = await QRCode.toDataURL(qr);
        // this.eventBus.emit('qr', {
        //   instanceId: this.instanceId,
        //   qrCode: qrCodeBase64,
        //   qrText: qr,
        // });

        this.events.onQR?.(qrCodeBase64, qr);
      }

      // CONNECTED
      if (connection === 'open') {
        this._isConnecting = false;

        const phone = this._socket?.user?.id?.split(':')[0] || '';

        // this.eventBus.emit('connected', {
        //   instanceId: this.instanceId,
        //   phone,
        // });

        this.events.onConnected?.(phone);
      }

      // CLOSED
      if (connection === 'close') {
        this._isConnecting = false;

        const result = this.classifyDisconnect(lastDisconnect?.error);
        // this.eventBus.emit('disconnected', {
        //   instanceId: this.instanceId,
        //   reason: result.reason,
        // });
        this.events.onDisconnected?.(result);

        // limpieza técnica mínima
        if (result.type === 'INVALID_SESSION' || result.type === 'LOGGED_OUT') {
          await this.clearAuthFolder();
        }
      }
    });
  }

  // ===============================
  // SOCKET ACCESS
  // ===============================
  getSocket(): WASocket {
    if (!this._socket) {
      throw new Error('Socket not initialized');
    }
    return this._socket;
  }

  // ===============================
  // DISCONNECT
  // ===============================
  async disconnect(): Promise<void> {
    this._intentionalClose = true;
    if (!this._socket) return;
    this._socket.end(new Boom('Manual disconnect'));
  }

  // ===============================
  // CLASSIFY DISCONNECT
  // ===============================
  private classifyDisconnect(error: unknown): {
    type: DisconnectType;
    reason?: string;
  } {
    const boom = error as Boom;
    if (!boom?.output) {
      return { type: 'INVALID_SESSION', reason: 'unknown' };
    }

    const code = boom?.output?.statusCode;

    switch (code) {
      case DisconnectReason.loggedOut:
        return { type: 'LOGGED_OUT', reason: 'loggedOut' };

      case DisconnectReason.badSession:
      case DisconnectReason.multideviceMismatch:
        return { type: 'INVALID_SESSION', reason: 'invalidSession' };

      default:
        return { type: 'TRANSIENT', reason: 'transient' };
    }
  }

  // ===============================
  // CLEAR SESSION
  // ===============================
  private async clearAuthFolder(): Promise<void> {
    try {
      // const fs = await import('fs/promises');
      await rm(this.getAuthPath(), { recursive: true, force: true });

      this._logger.warn({
        instanceId: this.instanceId,
        event: 'session_cleared',
      });
    } catch (error) {
      this._logger.error({
        instanceId: this.instanceId,
        error,
        event: 'failed_to_clear_session',
      });
    }
  }

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      delay(ms).then(() => {
        throw new Error('timeout');
      }),
    ]);
  }
}
