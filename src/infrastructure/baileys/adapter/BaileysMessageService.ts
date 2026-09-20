import { setTimeout as delay } from 'node:timers/promises';

import {
  AnyMessageContent,
  MiscMessageGenerationOptions,
  WAMessage,
  WAMessageKey,
  WASocket,
} from '@whiskeysockets/baileys';

import { ISentMessage, SentMessageContent } from '@domain/messages/MessageTypes';

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
  ): Promise<ISentMessage | undefined> {
    const message = await this.send(to, { text }, options);

    if (!message) {
      return undefined;
    }

    return this.toSentMessage(message, {
      messageType: 'text',
      text,
    });
  }

  async sendImage(
    to: string,
    image: Buffer | { url: string },
    caption?: string,
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined> {
    const message = await this.send(to, { image, caption }, options);

    if (!message) return undefined;

    return this.toSentMessage(message, {
      messageType: 'image',
      caption,
      media: {},
    });
  }

  async sendVideo(
    to: string,
    video: Buffer | { url: string },
    caption?: string,
    gifPlayback = false,
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined> {
    const message = await this.send(to, { video, caption, gifPlayback }, options);

    if (!message) return undefined;

    return this.toSentMessage(message, {
      messageType: 'video',
      caption,
      media: {},
    });
  }

  async sendAudio(
    to: string,
    audio: Buffer | { url: string },
    ptt = false,
    mimetype = 'audio/mp4',
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined> {
    const message = await this.send(to, { audio, ptt, mimetype }, options);

    if (!message) return undefined;

    return this.toSentMessage(message, {
      messageType: 'audio',
      media: { mimeType: mimetype, ptt },
    });
  }

  async sendDocument(
    to: string,
    document: Buffer | { url: string },
    fileName: string,
    mimetype: string,
    caption?: string,
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined> {
    const message = await this.send(to, { document, fileName, mimetype, caption }, options);

    if (!message) return undefined;

    return this.toSentMessage(message, {
      messageType: 'document',
      caption,
      media: { fileName, mimeType: mimetype },
    });
  }

  async sendSticker(
    to: string,
    sticker: Buffer | { url: string },
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined> {
    const message = await this.send(to, { sticker }, options);

    if (!message) return undefined;

    return this.toSentMessage(message, {
      messageType: 'sticker',
      media: {},
    });
  }

  async sendLocation(
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string,
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined> {
    const message = await this.send(
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

    if (!message) return undefined;

    return this.toSentMessage(message, {
      messageType: 'location',
      location: {
        latitude,
        longitude,
        name,
        address,
      },
    });
  }

  async sendContact(
    to: string,
    contacts: Array<{ displayName: string; vcard: string }>,
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined> {
    const message = await this.send(
      to,
      {
        contacts: {
          displayName: contacts[0]?.displayName || 'Contact',
          contacts: contacts.map((c) => ({ vcard: c.vcard })),
        },
      },
      options
    );

    if (!message) return undefined;

    return this.toSentMessage(message, {
      messageType: 'contact',
      contacts,
    });
  }

  async sendReaction(
    to: string,
    key: WAMessageKey,
    emoji: string
  ): Promise<ISentMessage | undefined> {
    const message = await this.send(to, {
      react: { text: emoji, key },
    });

    if (!message) return undefined;

    return this.toSentMessage(message, {
      messageType: 'reaction',
      reaction: {
        emoji,
        targetMessageId: key.id ?? '',
      },
    });
  }

  async sendPoll(
    to: string,
    name: string,
    values: string[],
    selectableCount = 1,
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined> {
    const message = await this.send(to, { poll: { name, values, selectableCount } }, options);

    if (!message) return undefined;

    return this.toSentMessage(message, {
      messageType: 'poll',
      poll: {
        name,
        values,
        selectableCount,
      },
    });
  }

  async forwardMessage(
    to: string,
    message: WAMessage,
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined> {
    const result = await this.send(to, { forward: message }, options);
    if (!result) return undefined;

    return this.toSentMessage(result, {
      messageType: 'forward',
      forward: {
        originalMessageId: message.key.id ?? '',
      },
    });
  }

  async deleteMessage(to: string, key: WAMessageKey): Promise<void> {
    await this.send(to, { delete: key });
  }

  async editMessage(to: string, key: WAMessageKey, text: string): Promise<WAMessage | undefined> {
    return await this.send(to, { edit: key, text });
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
  private getSenderId(): string {
    const user = this.socket.user;

    if (!user?.id) {
      throw new WhatsAppConnectionError('WhatsApp user identity is not available');
    }

    return user.id;
  }
  private toSentMessage(message: WAMessage, content: SentMessageContent): ISentMessage {
    if (!message.key.id) {
      throw new WhatsAppConnectionError('Sent message does not contain a message id');
    }

    return {
      messageId: message.key.id,
      chatId: message.key.remoteJid ?? message.key.remoteJidAlt ?? '',
      senderId: this.getSenderId(),
      timestamp: new Date(Number(message.messageTimestamp) * 1000),
      content,
    };
  }
}
