import path from 'path';

import NodeCache from '@cacheable/node-cache';
import makeWASocket, {
  CacheStore,
  WASocket,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';

export interface IBaileysConnectionEvents {
  onQR?: (qrBase64: string, qrText: string) => void;
  onConnected?: (phone: string) => void;
  onDisconnected?: (reason?: string) => void;
  onPairingCode?: (code: string) => void;
}

export class BaileysConnection {
  private _socket?: WASocket;
  private _logger = pino({ level: 'info' });
  private _msgRetryCounterCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }) as CacheStore;

  constructor(
    private readonly instanceId: string,
    private readonly events: IBaileysConnectionEvents
  ) {}

  private getAuthPath(): string {
    return path.join(process.cwd(), 'sessions', this.instanceId);
  }

  async connect(phoneNumber?: string): Promise<void> {
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

    if (!this._socket.authState.creds.registered && phoneNumber) {
      const code = await this._socket.requestPairingCode(phoneNumber);
      this.events.onPairingCode?.(code);
    }

    this._socket.ev.on('creds.update', saveCreds);

    this._socket.ev.on('connection.update', async (update) => {
      const { connection, qr } = update;

      if (qr) {
        const qrCodeBase64 = await QRCode.toDataURL(qr);
        this.events.onQR?.(qrCodeBase64, qr);
      }

      if (connection === 'open') {
        const phone = this._socket?.user?.id.split(':')[0] || '';
        this.events.onConnected?.(phone);
      }

      if (connection === 'close') {
        this.events.onDisconnected?.('closed');
      }
    });
  }

  getSocket(): WASocket {
    if (!this._socket) throw new Error('Socket not initialized');
    return this._socket;
  }

  async disconnect(): Promise<void> {
    await this._socket?.end(undefined);
  }
}
