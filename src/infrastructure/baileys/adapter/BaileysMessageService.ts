import { setTimeout as delay } from 'node:timers/promises';

import {
  AnyMessageContent,
  MiscMessageGenerationOptions,
  WAMessage,
  WAMessageKey,
  WASocket,
} from '@whiskeysockets/baileys';

import { IMessageService } from '@infrastructure/baileys/adapter/IMessageService';

import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

export class BaileysMessageService implements IMessageService {
  constructor(private readonly socket: WASocket) {}

  // ─────────────────────────────────────────────
  // CORE (single entry point)
  // ─────────────────────────────────────────────
  private async send(
    to: string,
    content: AnyMessageContent,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    if (!this.isValidJid(to)) {
      throw new WhatsAppConnectionError(`Invalid JID: ${to}`);
    }

    try {
      return await this.timeout(this.socket.sendMessage(to, content, options), 10000);
    } catch (error) {
      throw new WhatsAppConnectionError('Failed to send message', error);
    }
  }

  // ─────────────────────────────────────────────
  // PUBLIC METHODS
  // ─────────────────────────────────────────────

  async sendText(
    to: string,
    text: string,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return this.send(to, { text }, options);
  }

  async sendImage(
    to: string,
    image: Buffer | { url: string },
    caption?: string,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return this.send(to, { image, caption }, options);
  }

  async sendVideo(
    to: string,
    video: Buffer | { url: string },
    caption?: string,
    gifPlayback = false,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return this.send(to, { video, caption, gifPlayback }, options);
  }

  async sendAudio(
    to: string,
    audio: Buffer | { url: string },
    ptt = false,
    mimetype = 'audio/mp4',
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return this.send(to, { audio, ptt, mimetype }, options);
  }

  async sendDocument(
    to: string,
    document: Buffer | { url: string },
    fileName: string,
    mimetype: string,
    caption?: string,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return this.send(to, { document, fileName, mimetype, caption }, options);
  }

  async sendSticker(
    to: string,
    sticker: Buffer | { url: string },
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return this.send(to, { sticker }, options);
  }

  async sendLocation(
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return this.send(
      to,
      {
        location: {
          degreesLatitude: latitude,
          degreesLongitude: longitude,
          name,
          address,
        },
      },
      options
    );
  }

  async sendContact(
    to: string,
    contacts: Array<{ displayName: string; vcard: string }>,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return this.send(
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

  async sendReaction(to: string, key: WAMessageKey, emoji: string): Promise<WAMessage | undefined> {
    return this.send(to, {
      react: { text: emoji, key },
    });
  }

  async sendPoll(
    to: string,
    name: string,
    values: string[],
    selectableCount = 1,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return this.send(to, { poll: { name, values, selectableCount } }, options);
  }

  async forwardMessage(
    to: string,
    message: WAMessage,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined> {
    return this.send(to, { forward: message }, options);
  }

  async deleteMessage(to: string, key: WAMessageKey): Promise<void> {
    await this.send(to, { delete: key });
  }

  async editMessage(to: string, key: WAMessageKey, text: string): Promise<WAMessage | undefined> {
    return this.send(to, { edit: key, text });
  }

  async readMessages(keys: WAMessageKey[]): Promise<void> {
    try {
      await this.socket.readMessages(keys);
    } catch (error) {
      throw new WhatsAppConnectionError('Failed to mark messages as read', error);
    }
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  private isValidJid(jid: string): boolean {
    return jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us') || jid.endsWith('@lid');
  }

  private timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      delay(ms).then(() => {
        throw new Error('timeout');
      }),
    ]);
  }
}
