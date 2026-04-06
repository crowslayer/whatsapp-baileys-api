import fs from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import path from 'path';
import Stream from 'stream';

import NodeCache from '@cacheable/node-cache';
import { Boom } from '@hapi/boom';
import makeWASocket, {
  AnyMessageContent,
  CacheStore,
  Chat,
  DisconnectReason,
  GroupMetadata,
  LastMessageList,
  MiscMessageGenerationOptions,
  USyncQueryResultList,
  WAMessage,
  WAMessageKey,
  WAPrivacyGroupAddValue,
  WAPrivacyValue,
  WASocket,
  downloadMediaMessage,
  fetchLatestBaileysVersion,
  isJidGroup,
  isJidNewsletter,
  isPnUser,
  makeCacheableSignalKeyStore,
  proto,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';

import { IBaileysChat, IBaileysChatUpdate } from '@infrastructure/baileys/IBaileysChat';
import { IBaileysConnectionOptions } from '@infrastructure/baileys/IBaileysConnectionOptions';

import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

export class BaileysAdapter {
  private _socket?: WASocket;
  private _logger = pino({ level: 'info' });

  private _authPath: string;
  private _phoneNumber?: string;

  private _isConnecting = false;
  private _shouldReconnect = true;

  private _retryCount = 0;
  private _maxRetries = 5;
  private _baseDelay = 2000; // 2s

  private _msgRetryCounterCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }) as CacheStore;

  constructor(private readonly _options: IBaileysConnectionOptions) {
    const instanceId = _options.instanceId;
    const safeId = instanceId.replace(/[^a-zA-Z0-9-_]/g, '');
    this._authPath = path.join(process.cwd(), 'sessions', safeId);
  }

  // Connection

  async connect(phoneNumber?: string): Promise<void> {
    if (this._isConnecting) return;
    this._isConnecting = true;
    this._shouldReconnect = true;
    this._phoneNumber = phoneNumber;
    try {
      const { state, saveCreds } = await useMultiFileAuthState(this._authPath);
      const { version } = await fetchLatestBaileysVersion();

      if (this._socket) {
        this._socket.end(undefined);
        this._socket = undefined;
      }

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
        syncFullHistory: false,
        msgRetryCounterCache: this._msgRetryCounterCache,
        // getMessage: async () => undefined, // ← idealmente reemplazar con store
      });

      if (!this._socket.authState.creds.registered && phoneNumber) {
        const code = await this._socket.requestPairingCode(phoneNumber);
        this._options.onPairingCode?.(code);
      }
      this.setupEventHandlers(saveCreds);
      // reset retries
      this._retryCount = 0;
    } catch (error) {
      this._isConnecting = false;
      throw error; // await this.handleRetry(error, phoneNumber);
    }
  }
  private async handleRetry(error: unknown): Promise<void> {
    if (this._socket) {
      this._socket.end(undefined);
      this._socket = undefined;
    }

    if (this._retryCount >= this._maxRetries) {
      this._shouldReconnect = false;
      this._options.onConnectionClosed?.({
        reason: 'max_retries_exceeded',
        code: 500,
        recoverable: false,
      });

      return;
    }

    this._retryCount++;
    let delayTime = this._baseDelay;

    if (error instanceof Boom) {
      const statusCode = error.output.statusCode;

      if (statusCode === DisconnectReason.timedOut) {
        delayTime = this._baseDelay * 3;
      }

      if (statusCode === DisconnectReason.connectionLost) {
        delayTime = this._baseDelay * 2;
      }
    }
    delayTime = delayTime * Math.pow(2, this._retryCount); // exponential backoff

    this._logger.warn(
      `Retrying connection (${this._retryCount}/${this._maxRetries}) in ${delayTime}ms`
    );

    await delay(delayTime);

    await this.connect(this._phoneNumber);
  }

  // eslint-disable-next-line
  private setupEventHandlers(saveCreds: () => Promise<void>): void {
    if (!this._socket) return;
    // eslint-disable-next-line
    this._socket.ev.process(async (events) => {
      // Connection

      if (events['connection.update']) {
        const { connection, lastDisconnect, qr } = events['connection.update'];

        if (qr) {
          // Generar QR en base64 para mostrar en navegador
          const qrCodeBase64 = await QRCode.toDataURL(qr);
          // Pasar tanto el código QR en texto como en imagen
          this._options.onQRCode?.(qrCodeBase64, qr);
        }
        if (connection === 'open') {
          this._isConnecting = false;
          this._retryCount = 0;
          this._logger.info('Instance connected', {
            isntanceId: this._options?.instanceId,
            event: 'connection_open',
          });
          const phoneNumber = this._socket?.user?.id.split(':')[0] || '';
          this._options.onConnected?.(phoneNumber);
        }
        if (connection === 'close') {
          this._isConnecting = false;

          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const recoverable =
            statusCode !== DisconnectReason.loggedOut &&
            statusCode !== DisconnectReason.badSession &&
            statusCode !== DisconnectReason.multideviceMismatch;

          if (statusCode === DisconnectReason.loggedOut) {
            this._shouldReconnect = false;
            await this.clearAuthFolder();
            this._options.onConnectionClosed?.({
              reason: DisconnectReason[statusCode] || 'unknown',
              code: statusCode,
              recoverable: false,
            });
            return;
          }

          if (this._shouldReconnect) {
            this._logger.warn(`Connection closed with code: ${statusCode}`);

            // Manejo de errores específicos
            if (statusCode === DisconnectReason.restartRequired) {
              this._logger.info('Restart required, reconnecting', {
                isntanceId: this._options?.instanceId,
                event: 'connection_restart_reconnecting',
              });
              await this.handleRetry('Restart required');
            } else if (statusCode === DisconnectReason.timedOut) {
              this._logger.info('Connection timed out, reconnecting', {
                isntanceId: this._options?.instanceId,
                event: 'connection_timeout_reconnecting',
              });
              await this.handleRetry(lastDisconnect?.error);
            } else if (statusCode === DisconnectReason.connectionClosed) {
              this._logger.info('Connection closed, reconnecting', {
                isntanceId: this._options?.instanceId,
                event: 'connection_close_reconnecting',
              });
              await this.handleRetry(lastDisconnect?.error);
            } else if (statusCode === DisconnectReason.connectionLost) {
              this._logger.info('Connection lost, reconnecting', {
                isntanceId: this._options?.instanceId,
                event: 'connection_close_reconnecting',
              });
              await this.handleRetry(lastDisconnect?.error);
            } else if (statusCode === DisconnectReason.badSession) {
              this._logger.info('Connection bad sessdion, reconnecting', {
                isntanceId: this._options?.instanceId,
                event: 'connection_badsession_reconnecting',
              });
              await this.clearAuthFolder();
              this._options.onConnectionClosed?.({
                reason: DisconnectReason[statusCode] || 'unknown',
                code: statusCode,
                recoverable,
              });
            } else if (statusCode === DisconnectReason.multideviceMismatch) {
              this._logger.info('Connection Multidevice missmatch, reconnecting', {
                isntanceId: this._options?.instanceId,
                event: 'connection_multidevice_mismatch_reconnecting',
              });
              await this.clearAuthFolder();
              this._options.onConnectionClosed?.({
                reason: DisconnectReason[statusCode] || 'unknown',
                code: statusCode,
                recoverable,
              });
            }
          }
        }
      }

      // Creds
      if (events['creds.update']) {
        await saveCreds();
      }

      // Messages
      if (events['messages.upsert']) {
        const { messages, type } = events['messages.upsert'];

        if (type === 'notify') {
          await Promise.all(
            messages.map((msg) => {
              if (
                !msg.key.fromMe &&
                msg.message &&
                !isJidNewsletter(msg.key.remoteJid ?? '') &&
                msg.key.remoteJid !== 'status@broadcast'
              ) {
                return this._options.onMessage?.(msg);
              }
            })
          );
        }
      }
      if (events['messages.update']) {
        // await this._options.onMessagesUpdate?.(events['messages.update']);
      }
      // History chats
      if (events['messaging-history.set']) {
        const { chats } = events['messaging-history.set'];

        if (chats?.length) {
          const mapped = chats.map((chat) => this.mapChat(chat)).filter((c) => c !== null);
          await this._options.onChatsUpsert?.(mapped, true);
        }
      }

      // ── Chats: nuevos en tiempo real ──────────────────────────────────────────
      if (events['chats.upsert']) {
        const mapped = events['chats.upsert'].map((c) => this.mapChat(c)).filter((c) => c !== null);

        if (mapped.length > 0) {
          await this._options.onChatsUpsert?.(mapped, false);
        }
      }
      // ── Chats: actualizaciones parciales (unread, timestamp, mute, archive) ───
      if (events['chats.update']) {
        const partial: IBaileysChatUpdate[] = events['chats.update'].map((u) => ({
          chatId: String(u.id),
          ...(u.unreadCount !== undefined && { unreadCount: u.unreadCount ?? 0 }),
          ...(u.archived !== undefined && { isArchived: u.archived ?? false }),
          ...(u.muteEndTime !== undefined && { isMuted: Number(u.muteEndTime) > 0 }),
        }));

        await this._options.onChatsUpdate?.(partial);
      }

      // ── Chats: eliminados ─────────────────────────────────────────────────────
      if (events['chats.delete']) {
        await this._options.onChatsDelete?.(events['chats.delete']);
      }

      // ── Contactos ────────────────────────────────────────────────────────────
      if (events['contacts.upsert']) {
        await this._options.onContactsUpsert?.(events['contacts.upsert']);
      }

      if (events['contacts.update']) {
        await this._options.onContactsUpdate?.(events['contacts.update']);
      }

      // ── Presencia ────────────────────────────────────────────────────────────
      if (events['presence.update']) {
        await this._options.onPresenceUpdate?.(events['presence.update']);
      }

      // ── Grupos ───────────────────────────────────────────────────────────────
      if (events['groups.upsert']) {
        await this._options.onGroupsUpsert?.(events['groups.upsert']);
      }

      if (events['groups.update']) {
        await this._options.onGroupsUpdate?.(events['groups.update']);
      }

      if (events['group-participants.update']) {
        await this._options.onGroupParticipantsUpdate?.(events['group-participants.update']);
      }

      // ── Llamadas ─────────────────────────────────────────────────────────────
      if (events['call']) {
        await this._options.onCall?.(events['call']);
      }

      // ── Labels ───────────────────────────────────────────────────────────────
      if (events['labels.association']) {
        await this._options.onLabelsAssociation?.(events['labels.association']);
      }

      if (events['labels.edit']) {
        await this._options.onLabelsEdit?.(events['labels.edit']);
      }
    });
  }

  async sendMessage(
    to: string,
    content: AnyMessageContent,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    if (!this._socket) {
      throw new WhatsAppConnectionError('Instance not connected');
    }
    try {
      if (!this.isValidJid(to)) return;
      return await this._socket.sendMessage(to, content, options);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to send message for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  async sendText(
    to: string,
    text: string,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return await this.sendMessage(to, { text }, options);
  }

  async sendImage(
    to: string,
    image: Buffer | { url: string },
    caption?: string,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return await this.sendMessage(to, { image, caption } as AnyMessageContent, options);
  }

  async sendVideo(
    to: string,
    video: Buffer | { url: string },
    caption?: string,
    gifPlayback = false,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return await this.sendMessage(
      to,
      { video, caption, gifPlayback } as AnyMessageContent,
      options
    );
  }

  async sendAudio(
    to: string,
    audio: Buffer | { url: string },
    ptt = false,
    mimetype = 'audio/mp4',
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return await this.sendMessage(to, { audio, ptt, mimetype } as AnyMessageContent, options);
  }

  async sendDocument(
    to: string,
    document: Buffer | { url: string },
    fileName: string,
    mimetype: string,
    caption?: string,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return await this.sendMessage(
      to,
      { document, fileName, mimetype, caption } as AnyMessageContent,
      options
    );
  }

  async sendSticker(
    to: string,
    sticker: Buffer | { url: string },
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return await this.sendMessage(to, { sticker } as AnyMessageContent, options);
  }

  async sendLocation(
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return await this.sendMessage(
      to,
      { location: { degreesLatitude: latitude, degreesLongitude: longitude, name, address } },
      options
    );
  }

  async sendContact(
    to: string,
    contacts: Array<{ displayName: string; vcard: string }>,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return await this.sendMessage(
      to,
      {
        contacts: {
          displayName: contacts[0]?.displayName || 'Contact',
          contacts: contacts.map((c) => ({ vcard: c.vcard })),
        },
      },
      options
    );
  }

  async sendReaction(
    to: string,
    targetKey: WAMessageKey,
    emoji: string
  ): Promise<WAMessage | undefined> {
    return await this.sendMessage(to, {
      react: { text: emoji, key: targetKey },
    });
  }

  /**
   * Envía un poll (encuesta).
   * Los resultados llegan en el evento messages.update → update.pollUpdates.
   */
  async sendPoll(
    to: string,
    name: string,
    values: string[],
    selectableCount = 1,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return await this.sendMessage(to, { poll: { name, values, selectableCount } }, options);
  }

  /**
   * Reenvía un mensaje existente a otro chat.
   */
  async forwardMessage(
    to: string,
    message: WAMessage,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not coneccted');
    try {
      return await this._socket.sendMessage(to, { forward: message }, options);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to forward message for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Elimina un mensaje para todos.
   */
  async deleteMessage(to: string, key: WAMessageKey): Promise<proto.IWebMessageInfo | undefined> {
    return await this.sendMessage(to, { delete: key });
  }

  /**
   * Edita el texto de un mensaje propio ya enviado.
   */
  async editMessage(
    to: string,
    key: WAMessageKey,
    newText: string
  ): Promise<proto.IWebMessageInfo | undefined> {
    return await this.sendMessage(to, {
      edit: key,
      text: newText,
    } as AnyMessageContent);
  }

  /**
   * Marca un mensaje como leído. Pasa la clave del último mensaje leído.
   */
  async readMessages(keys: WAMessageKey[]): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('instance not connected');
    try {
      await this._socket.readMessages(keys);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to mark messages as read for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Descarga el binario de un mensaje multimedia recibido.
   */
  async downloadMediaMessage(
    message: proto.IWebMessageInfo,
    type: 'buffer' | 'stream' = 'buffer'
  ): Promise<Buffer | Stream> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      return await downloadMediaMessage(
        message as WAMessage,
        type,
        {},
        { logger: this._logger, reuploadRequest: this._socket.updateMediaMessage }
      );
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to download media for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  // ─── Presencia ───────────────────────────────────────────────────────────────

  /**
   * Suscribe a actualizaciones de presencia (online/offline/typing) de un JID.
   * Las actualizaciones llegan por el evento presence.update → onPresenceUpdate.
   */
  async subscribePresence(jid: string): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      await this._socket.presenceSubscribe(jid);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to subscribe to presence for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Publica el estado de presencia propio en un chat (composing, recording, paused).
   */
  async updatePresence(
    jid: string,
    type: 'unavailable' | 'available' | 'composing' | 'recording' | 'paused'
  ): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      await this._socket.sendPresenceUpdate(type, jid);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to update presence for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  // ─── Perfil ──────────────────────────────────────────────────────────────────

  /**
   * Obtiene la URL de la foto de perfil de un JID (usuario o grupo).
   * @param type 'image' para alta resolución, undefined para baja.
   */
  async getProfilePictureUrl(jid: string, type?: 'image'): Promise<string | undefined> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      return await this._socket.profilePictureUrl(jid, type);
    } catch {
      // WA lanza error si el contacto no tiene foto o bloqueó el acceso
      return undefined;
    }
  }

  /**
   * Obtiene el estado/bio de texto de un JID.
   */
  async getStatus(jid: string): Promise<USyncQueryResultList[] | undefined> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      return await this._socket.fetchStatus(jid);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to fetch status for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Verifica si uno o más números están registrados en WhatsApp.
   * Retorna el JID canónico (puede ser LID en v7) si existe.
   */
  async checkWhatsAppNumber(
    jids: string | string[]
  ): Promise<Array<{ jid: string; exists: boolean }>> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      const result = await this._socket.onWhatsApp(...(Array.isArray(jids) ? jids : [jids]));
      if (!result) throw new Error('Not found');
      return result.map((r) => ({ jid: r.jid, exists: r.exists }));
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to check WhatsApp numbers for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Actualiza la foto de perfil propia o de un grupo del que se es admin.
   */
  async updateProfilePicture(jid: string, image: Buffer | { url: string }): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      await this._socket.updateProfilePicture(jid, image);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to update profile picture for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Actualiza el nombre de perfil propio.
   */
  async updateProfileName(name: string): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      await this._socket.updateProfileName(name);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to update profile name for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Obtiene el perfil de negocio de un JID (solo cuentas Business).
   */
  async getBusinessProfile(jid: string): Promise<unknown> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      return await this._socket.getBusinessProfile(jid);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to get business profile for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  // ─── App state: archivos de chat y estado ────────────────────────────────────

  /**
   * Archiva o desarchiva un chat.
   */
  async archiveChat(jid: string, archive: boolean): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      await this._socket.chatModify({ archive, lastMessages: [] }, jid);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to archive chat for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Silencia o activa las notificaciones de un chat.
   * @param until timestamp Unix en ms hasta cuando silenciar; null para reactivar.
   */
  async muteChat(jid: string, until: number | null): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      await this._socket.chatModify({ mute: until }, jid);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to mute chat for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Marca un chat como leído o no leído.
   */
  async markChatRead(jid: string, lastMessages: LastMessageList, read: boolean): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      await this._socket.chatModify({ markRead: read, lastMessages }, jid);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to mark chat as read for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Fija o desfija un chat en la lista principal.
   */
  async pinChat(jid: string, pin: boolean): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      await this._socket.chatModify({ pin }, jid);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to pin chat for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Activa o desactiva mensajes temporales (disappearing) en un chat.
   * @param expiration segundos. 0 para desactivar. Valores típicos: 86400 (1d), 604800 (7d), 7776000 (90d).
   */
  async setDisappearingMessages(jid: string, expiration: number): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      await this._socket.sendMessage(jid, {
        disappearingMessagesInChat: expiration,
      } as AnyMessageContent);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to set disappearing messages for instance ${this._options.instanceId}`,
        error
      );
    }
  }
  // ─── Privacidad y bloqueo ─────────────────────────────────────────────────────

  /**
   * Bloquea o desbloquea un JID.
   */
  async updateBlockStatus(jid: string, action: 'block' | 'unblock'): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      await this._socket.updateBlockStatus(jid, action);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to update block status for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Obtiene la lista completa de JIDs bloqueados.
   */
  async fetchBlocklist(): Promise<(string | undefined)[]> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      return await this._socket.fetchBlocklist();
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to fetch blocklist for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Obtiene la configuración de privacidad actual.
   */
  async fetchPrivacySettings(): Promise<Record<string, string>> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      return await this._socket.fetchPrivacySettings(true);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to fetch privacy settings for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Actualiza la privacidad del último visto.
   */
  async updateLastSeenPrivacy(
    value: 'all' | 'contacts' | 'contacts_blacklist' | 'none'
  ): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    await this._socket.updateLastSeenPrivacy(value as WAPrivacyValue);
  }

  /**
   * Actualiza la privacidad de la foto de perfil.
   */
  async updateProfilePicturePrivacy(
    value: 'all' | 'contacts' | 'contacts_blacklist' | 'none'
  ): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    await this._socket.updateProfilePicturePrivacy(value as WAPrivacyValue);
  }

  /**
   * Actualiza la privacidad del estado/bio.
   */
  async updateStatusPrivacy(
    value: 'all' | 'contacts' | 'contacts_blacklist' | 'none'
  ): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    await this._socket.updateStatusPrivacy(value as WAPrivacyValue);
  }

  /**
   * Actualiza la privacidad de lectura de mensajes (doble check azul).
   */
  async updateReadReceiptsPrivacy(value: 'all' | 'none'): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    await this._socket.updateReadReceiptsPrivacy(value);
  }

  /**
   * Actualiza quién puede agregar a grupos.
   */
  async updateGroupsAddPrivacy(
    value: 'all' | 'contacts' | 'contacts_blacklist' | 'none'
  ): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    await this._socket.updateGroupsAddPrivacy(value as WAPrivacyGroupAddValue);
  }

  /**
   * Actualiza la privacidad del estado online.
   */
  async updateOnlinePrivacy(value: 'all' | 'match_last_seen'): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    await this._socket.updateOnlinePrivacy(value);
  }

  // ─── Grupos ───────────────────────────────────────────────────────────────────

  async createGroup(name: string, participants: string[]): Promise<string> {
    if (!this._socket) {
      throw new WhatsAppConnectionError('WhatsApp Socket not connected');
    }

    try {
      const group = await this._socket.groupCreate(name, participants);
      return group.id;
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to create group for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Obtiene la metadata completa de un grupo específico.
   */
  async getGroupMetadata(groupId: string): Promise<GroupMetadata> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      return await this._socket.groupMetadata(groupId);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to get group metadata for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Obtiene metadata de todos los grupos en los que participa.
   * Solo necesario para sincronización explícita; la lectura normal va por el repositorio.
   */
  async syncGroupsMetadata(): Promise<IBaileysChat[]> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      await delay(3000);

      const groups = await this._socket.groupFetchAllParticipating();
      return Object.entries(groups).map(([groupId, meta]) => ({
        chatId: groupId,
        name: meta.subject || groupId,
        type: 'group' as const,
        unreadCount: 0,
        isArchived: false,
        isMuted: false,
        participantCount: meta.participants?.length,
        description: meta.desc,
      }));
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to sync group metadata for instance ${this._options.instanceId}`,
        error
      );
    }
  }
  async addParticipantsToGroup(groupId: string, participants: string[]): Promise<void> {
    if (!this._socket) {
      throw new WhatsAppConnectionError('Instance not connected');
    }

    try {
      await this._socket.groupParticipantsUpdate(groupId, participants, 'add');
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to add participants for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  async removeParticipantsFromGroup(groupId: string, participants: string[]): Promise<void> {
    if (!this._socket) {
      throw new WhatsAppConnectionError('Instance not connected');
    }

    try {
      await this._socket.groupParticipantsUpdate(groupId, participants, 'remove');
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to remove participants sfor instance ${this._options.instanceId}`,
        error
      );
    }
  }

  async promoteParticipants(groupId: string, participants: string[]): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      await this._socket.groupParticipantsUpdate(groupId, participants, 'promote');
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to promote participants for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  async demoteParticipants(groupId: string, participants: string[]): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      await this._socket.groupParticipantsUpdate(groupId, participants, 'demote');
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to demote participants for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  async updateGroupSubject(groupId: string, subject: string): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      await this._socket.groupUpdateSubject(groupId, subject);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to update group subject for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  async updateGroupDescription(groupId: string, description: string): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      await this._socket.groupUpdateDescription(groupId, description);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to update group description for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Obtiene el link de invitación del grupo.
   */
  async getGroupInviteLink(groupId: string): Promise<string> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      const link = await this._socket.groupInviteCode(groupId);
      if (!link) throw new Error('Link no found');
      return link;
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to get group invite link for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Revoca el link de invitación y genera uno nuevo.
   */
  async revokeGroupInviteLink(groupId: string): Promise<string> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      const invite = await this._socket.groupRevokeInvite(groupId);
      if (!invite) throw new Error('Invite Link not found');

      return invite;
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to revoke group invite link for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Acepta una invitación de grupo por código.
   */
  async acceptGroupInvite(code: string): Promise<string | undefined> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      return await this._socket.groupAcceptInvite(code);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to accept group invite for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Abandona un grupo.
   */
  async leaveGroup(groupId: string): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      await this._socket.groupLeave(groupId);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to leave group for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  /**
   * Cambia los ajustes del grupo (quién puede enviar mensajes o editar info).
   */
  async updateGroupSettings(
    groupId: string,
    setting: 'announcement' | 'not_announcement' | 'locked' | 'unlocked'
  ): Promise<void> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      await this._socket.groupSettingUpdate(groupId, setting);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to update group settings for instance ${this._options.instanceId}`,
        error
      );
    }
  }
  // ─── Historial bajo demanda ───────────────────────────────────────────────────

  /**
   * Solicita al dispositivo principal mensajes históricos más antiguos de un chat.
   * Los mensajes llegan por el evento messaging-history.set con syncType ON_DEMAND.
   * @param count máximo 50 por solicitud
   */
  async fetchMessageHistory(
    count: number,
    oldestMessageKey: WAMessageKey,
    oldestMessageTimestamp: number
  ): Promise<string | undefined> {
    if (!this._socket) throw new WhatsAppConnectionError('Instance not connected');
    try {
      return await this._socket.fetchMessageHistory(
        count,
        oldestMessageKey,
        oldestMessageTimestamp
      );
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to fetch message history for instance ${this._options.instanceId}`,
        error
      );
    }
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  async logout(): Promise<void> {
    this._shouldReconnect = false;

    if (this._socket) {
      this._logger.info('Instances Logged Out', {
        InstanceId: this._options.instanceId,
        event: 'connection_closed',
      });
      await this._socket.logout();
      this._socket = undefined;
    }
  }

  async disconnect(): Promise<void> {
    this._shouldReconnect = false;

    if (this._socket) {
      this._logger.info('Instances disconected', {
        InstanceId: this._options.instanceId,
        event: 'connection_closed',
      });
      this._socket.end(undefined);
      this._socket = undefined;
    }
    this._msgRetryCounterCache.flushAll();
  }

  async reconnect(phone?: string): Promise<void> {
    this._retryCount = 0;
    this._shouldReconnect = true;

    await this.connect(phone);
  }

  getSocket(): WASocket | undefined {
    return this._socket;
  }

  async isAlive(): Promise<boolean> {
    return !!this._socket?.user;
  }

  // ─── Helpers privados ────────────────────────────────────────────────────────
  private async clearAuthFolder(): Promise<void> {
    try {
      if (fs.existsSync(this._authPath)) {
        await fs.promises.rm(this._authPath, { recursive: true, force: true });
      }
    } catch (error) {
      this._logger.error('Error flush auth folder', error);
    }
  }

  private normalizePhoneNumber(phone: string): string {
    return `${phone.replace(/\D/g, '')}@s.whatsapp.net`;
  }

  private isValidJid(jid: string): boolean {
    return jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us') || jid.endsWith('@lid');
  }

  /**
   * Convierte un WAChat de Baileys v7 al DTO interno.
   * Retorna null para JIDs que no son chats reales (broadcast, newsletters, status).
   *
   * Cambios v7:
   * - isJidUser() eliminado → isPnUser() para @s.whatsapp.net
   * - @lid: identificador anónimo nuevo para grupos grandes (también es chat individual)
   * - isJidNewsletter(): canales/newsletters, se excluyen del procesamiento
   */
  private mapChat(chat: Chat): IBaileysChat | null {
    const jid: string = String(chat.id);

    if (jid === 'status@broadcast' || jid.endsWith('@broadcast') || isJidNewsletter(jid)) {
      return null;
    }

    const isGroup = isJidGroup(jid);
    const isChat = isPnUser(jid) || jid.endsWith('@lid');

    if (!isGroup && !isChat) return null;

    return {
      chatId: jid,
      name: chat.name || chat.username || jid,
      type: isGroup ? 'group' : 'chat',
      unreadCount: chat.unreadCount ?? 0,
      isArchived: chat.archived ?? false,
      isMuted: Number(chat.muteEndTime) > 0,
    };
  }
}
