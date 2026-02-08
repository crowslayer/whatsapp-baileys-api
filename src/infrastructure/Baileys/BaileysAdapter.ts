import path from 'path';

import { Boom } from '@hapi/boom';
import makeWASocket, {
  DisconnectReason,
  WASocket,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  proto,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';

import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

export interface IBaileysConnectionOptions {
  instanceId: string;
  onQRCode?: (qrBase64: string, qrText: string) => void;
  onPairingCode?: (code: string) => void;
  onConnected?: (phoneNumber: string) => void;
  onDisconnected?: (reason?: string) => void;
  onMessage?: (message: any) => void;
}

export class BaileysAdapter {
  private _socket?: WASocket;
  private _logger = pino({ level: 'silent' });
  private _options: IBaileysConnectionOptions;
  private _authPath: string;

  constructor(_options: IBaileysConnectionOptions) {
    this._options = _options;
    this._authPath = path.join(process.cwd(), 'sessions', _options.instanceId);
  }

  async connect(): Promise<void> {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(this._authPath);
      const { version } = await fetchLatestBaileysVersion();

      this._socket = makeWASocket({
        version,
        logger: this._logger,
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, this._logger),
        },
        browser: ['WhatsApp API', 'Chrome', '4.0.0'],
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        getMessage: async (key) => {
          return { conversation: 'Message not found' };
        },
      });

      this.setupEventHandlers(saveCreds);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to connect instance ${this._options.instanceId}`,
        error
      );
    }
  }

  async connectWithPairingCode(phoneNumber: string): Promise<void> {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(this._authPath);
      const { version } = await fetchLatestBaileysVersion();

      this._socket = makeWASocket({
        version,
        logger: this._logger,
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, this._logger),
        },
        browser: ['WhatsApp API', 'Chrome', '4.0.0'],
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
      });

      if (!this._socket.authState.creds.registered) {
        const code = await this._socket.requestPairingCode(phoneNumber);
        this._options.onPairingCode?.(code);
      }

      this.setupEventHandlers(saveCreds);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to connect with pairing code for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  private setupEventHandlers(saveCreds: () => Promise<void>): void {
    if (!this._socket) return;

    this._socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        // Generar QR en base64 para mostrar en navegador
        const qrCodeBase64 = await QRCode.toDataURL(qr);
        // Pasar tanto el código QR en texto como en imagen
        this._options.onQRCode?.(qrCodeBase64, qr);
      }

      if (connection === 'close') {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

        if (shouldReconnect) {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

          // Manejo de errores específicos
          if (statusCode === DisconnectReason.restartRequired) {
            this._logger.info('Restart required, reconnecting...');
            await this.connect();
          } else if (statusCode === DisconnectReason.timedOut) {
            this._logger.info('Connection timed out, reconnecting...');
            await this.connect();
          } else if (statusCode === DisconnectReason.connectionClosed) {
            this._logger.info('Connection closed, reconnecting...');
            await this.connect();
          } else if (statusCode === DisconnectReason.connectionLost) {
            this._logger.info('Connection lost, reconnecting...');
            await this.connect();
          } else {
            this._logger.info('Connection closed, reconnecting...');
            await this.connect();
          }
        } else {
          this._options.onDisconnected?.('Logged out');
        }
      } else if (connection === 'open') {
        const phoneNumber = this._socket?.user?.id.split(':')[0] || '';
        this._options.onConnected?.(phoneNumber);
      }
    });

    this._socket.ev.on('creds.update', saveCreds);

    this._socket.ev.on('messages.upsert', async ({ messages }) => {
      for (const message of messages) {
        if (!message.key.fromMe) {
          this._options.onMessage?.(message);
        }
      }
    });
  }

  async sendMessage(to: string, message: string): Promise<void> {
    if (!this._socket) {
      throw new WhatsAppConnectionError('_Socket not connected');
    }

    try {
      await this._socket.sendMessage(to, { text: message });
    } catch (error: any) {
      throw new WhatsAppConnectionError(`Failed to send message: ${error.message}`, error);
    }
  }

  async sendImage(to: string, image: Buffer, caption?: string, fileName?: string): Promise<void> {
    if (!this._socket) {
      throw new WhatsAppConnectionError('_Socket not connected');
    }

    try {
      await this._socket.sendMessage(to, {
        image,
        caption,
        fileName: fileName || 'image.jpg',
      });
    } catch (error: any) {
      throw new WhatsAppConnectionError(`Failed to send image: ${error.message}`, error);
    }
  }

  async sendDocument(
    to: string,
    document: Buffer,
    fileName: string,
    mimetype: string,
    caption?: string
  ): Promise<void> {
    if (!this._socket) {
      throw new WhatsAppConnectionError('_Socket not connected');
    }

    try {
      await this._socket.sendMessage(to, {
        document,
        fileName,
        mimetype,
        caption,
      });
    } catch (error: any) {
      throw new WhatsAppConnectionError(`Failed to send document: ${error.message}`, error);
    }
  }

  async sendAudio(
    to: string,
    audio: Buffer,
    ptt: boolean = false,
    mimetype?: string
  ): Promise<void> {
    if (!this._socket) {
      throw new WhatsAppConnectionError('_Socket not connected');
    }

    try {
      await this._socket.sendMessage(to, {
        audio,
        ptt, // Push to talk (nota de voz)
        mimetype: mimetype || 'audio/mp4',
      });
    } catch (error: any) {
      throw new WhatsAppConnectionError(`Failed to send audio: ${error.message}`, error);
    }
  }

  async sendVideo(
    to: string,
    video: Buffer,
    caption?: string,
    gifPlayback?: boolean,
    fileName?: string
  ): Promise<void> {
    if (!this._socket) {
      throw new WhatsAppConnectionError('_Socket not connected');
    }

    try {
      await this._socket.sendMessage(to, {
        video,
        caption,
        gifPlayback: gifPlayback || false,
        fileName: fileName || 'video.mp4',
      });
    } catch (error: any) {
      throw new WhatsAppConnectionError(`Failed to send video: ${error.message}`, error);
    }
  }

  async sendSticker(to: string, sticker: Buffer): Promise<void> {
    if (!this._socket) {
      throw new WhatsAppConnectionError('_Socket not connected');
    }

    try {
      await this._socket.sendMessage(to, {
        sticker,
      });
    } catch (error: any) {
      throw new WhatsAppConnectionError(`Failed to send sticker: ${error.message}`, error);
    }
  }

  async sendLocation(
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string
  ): Promise<void> {
    if (!this._socket) {
      throw new WhatsAppConnectionError('_Socket not connected');
    }

    try {
      await this._socket.sendMessage(to, {
        location: {
          degreesLatitude: latitude,
          degreesLongitude: longitude,
          name,
          address,
        },
      });
    } catch (error: any) {
      throw new WhatsAppConnectionError(`Failed to send location: ${error.message}`, error);
    }
  }

  async sendContact(
    to: string,
    contacts: Array<{ displayName: string; vcard: string }>
  ): Promise<void> {
    if (!this._socket) {
      throw new WhatsAppConnectionError('_Socket not connected');
    }

    try {
      await this._socket.sendMessage(to, {
        contacts: {
          displayName: contacts[0]?.displayName || 'Contact',
          contacts: contacts.map((c) => ({ vcard: c.vcard })),
        },
      });
    } catch (error: any) {
      throw new WhatsAppConnectionError(`Failed to send contact: ${error.message}`, error);
    }
  }

  async sendReaction(chatId: string, messageId: string, emoji: string): Promise<void> {
    if (!this._socket) {
      throw new WhatsAppConnectionError('_Socket not connected');
    }

    try {
      await this._socket.sendMessage(chatId, {
        react: {
          text: emoji,
          key: { remoteJid: chatId, id: messageId },
        },
      });
    } catch (error: any) {
      throw new WhatsAppConnectionError(`Failed to send reaction: ${error.message}`, error);
    }
  }

  async sendMediaMessage(to: string, media: Buffer, caption?: string): Promise<void> {
    if (!this._socket) {
      throw new WhatsAppConnectionError('_Socket not connected');
    }

    try {
      await this._socket.sendMessage(to, {
        image: media,
        caption,
      });
    } catch (error: any) {
      throw new WhatsAppConnectionError(`Failed to send media: ${error.message}`, error);
    }
  }

  async createGroup(name: string, participants: string[]): Promise<string> {
    if (!this._socket) {
      throw new WhatsAppConnectionError('_Socket not connected');
    }

    try {
      const group = await this._socket.groupCreate(name, participants);
      return group.id;
    } catch (error: any) {
      throw new WhatsAppConnectionError(`Failed to create group: ${error.message}`, error);
    }
  }

  async addParticipantsToGroup(groupId: string, participants: string[]): Promise<void> {
    if (!this._socket) {
      throw new WhatsAppConnectionError('_Socket not connected');
    }

    try {
      await this._socket.groupParticipantsUpdate(groupId, participants, 'add');
    } catch (error: any) {
      throw new WhatsAppConnectionError(`Failed to add participants: ${error.message}`, error);
    }
  }

  async removeParticipantsFromGroup(groupId: string, participants: string[]): Promise<void> {
    if (!this._socket) {
      throw new WhatsAppConnectionError('_Socket not connected');
    }

    try {
      await this._socket.groupParticipantsUpdate(groupId, participants, 'remove');
    } catch (error: any) {
      throw new WhatsAppConnectionError(`Failed to remove participants: ${error.message}`, error);
    }
  }

  async logout(): Promise<void> {
    if (this._socket) {
      await this._socket.logout();
    }
  }

  disconnect(): void {
    if (this._socket) {
      this._socket.end(undefined);
      this._socket = undefined;
    }
  }

  get_Socket(): WASocket | undefined {
    return this._socket;
  }
}
