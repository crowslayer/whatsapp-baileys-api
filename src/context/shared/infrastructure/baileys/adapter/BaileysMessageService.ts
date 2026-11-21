import { setTimeout as delay } from 'node:timers/promises';

import {
  AnyMessageContent,
  MiscMessageGenerationOptions,
  WAMessage,
  WAMessageKey,
  WASocket,
} from '@whiskeysockets/baileys';

import { RequestFile } from '@shared/domain/RequestFile';
import { IMessageService } from '@shared/domain/whatsapp/IMessageService';
import {
  IMessageReference,
  IMessageSendOptions,
  ISentMessage,
  SentMessageContent,
} from '@shared/domain/whatsapp/MessageTypes';
import { BaileysError } from '@shared/infrastructure/baileys/adapter/BaileysError';
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
    this.isValidJid(to);

    try {
      return await this.timeout(this.socket.sendMessage(to, content, options), 10000);
    } catch (error) {
      throw new WhatsAppConnectionError('Failed to send message', { cause: error });
    }
  }

  // ─────────────────────────────────────────────
  // PUBLIC METHODS
  // ─────────────────────────────────────────────

  async sendText(
    to: string,
    text: string,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined> {
    const baileysOption = this.toBaileysOptions(options);

    const message = await this.send(to, { text }, baileysOption);

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
    image: RequestFile,
    caption?: string,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined> {
    const baileysOption = this.toBaileysOptions(options);

    let message = undefined;
    let media = {};
    if (image.source === 'local') {
      message = await this.send(
        to,
        { image: image.buffer, mimetype: image.mimetype, caption },
        baileysOption
      );
      media = {
        fileName: image.filename,
        mimeType: image.mimetype,
        fileLength: image.buffer.byteLength,
      };
    }

    if (image.source === 'remote') {
      message = await this.send(to, { image: { url: image.url } }, baileysOption);
      media = {
        url: image.url,
      };
    }

    if (!message) return undefined;

    return this.toSentMessage(message, {
      messageType: 'image',
      caption,
      media,
    });
  }

  async sendVideo(
    to: string,
    video: RequestFile,
    caption?: string,
    gifPlayback = false,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined> {
    const baileysOption = this.toBaileysOptions(options);

    let message = undefined;
    let media = {};
    if (video.source === 'local') {
      message = await this.send(
        to,
        { video: video.buffer, mimetype: video.mimetype, caption, gifPlayback },
        baileysOption
      );
      media = {
        fileName: video.filename,
        mimeType: video.mimetype,
        fileLength: video.buffer.byteLength,
      };
    }

    if (video.source === 'remote') {
      message = await this.send(to, { video: { url: video.url } }, baileysOption);
      media = {
        url: video.url,
      };
    }

    if (!message) return undefined;

    return this.toSentMessage(message, {
      messageType: 'video',
      caption,
      media,
    });
  }

  async sendAudio(
    to: string,
    audio: RequestFile,
    ptt = false,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined> {
    const baileysOption = this.toBaileysOptions(options);

    let message = undefined;

    if (audio.source === 'local') {
      message = await this.send(
        to,
        { audio: audio.buffer, ptt, mimetype: audio.mimetype },
        baileysOption
      );
    }
    if (audio.source === 'remote') {
      message = await this.send(to, { audio: { url: audio.url }, ptt }, baileysOption);
    }

    if (!message) return undefined;

    return this.toSentMessage(message, {
      messageType: 'audio',
      media: { ...audio, ptt },
    });
  }

  async sendDocument(
    to: string,
    document: RequestFile,
    mimetype: string,
    caption?: string,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined> {
    const baileysOption = this.toBaileysOptions(options);

    let message = undefined;

    if (document.source === 'local') {
      message = await this.send(
        to,
        {
          document: document.buffer,
          fileName: document.filename,
          mimetype: document.mimetype,
          caption,
        },
        baileysOption
      );
    }

    if (document.source === 'remote') {
      message = await this.send(to, { document: { url: document.url }, mimetype }, options);
    }

    if (!message) return undefined;

    return this.toSentMessage(message, {
      messageType: 'document',
      caption,
      media: { ...document, mimeType: mimetype },
    });
  }

  async sendSticker(
    to: string,
    sticker: RequestFile,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined> {
    const baileysOption = this.toBaileysOptions(options);

    let message = undefined;

    if (sticker.source === 'local') {
      message = await this.send(
        to,
        {
          sticker: sticker.buffer,
          fileName: sticker.filename,
          mimetype: sticker.mimetype,
        },
        baileysOption
      );
    }

    if (sticker.source === 'remote') {
      message = await this.send(to, { sticker: { url: sticker.url } }, options);
    }

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
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined> {
    const baileysOption = this.toBaileysOptions(options);

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
      baileysOption
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
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined> {
    const message = await this.send(
      to,
      {
        contacts: {
          displayName: contacts[0]?.displayName || 'Contact',
          contacts: contacts.map((c) => ({ vcard: c.vcard })),
        },
      },
      this.toBaileysOptions(options)
    );

    if (!message) return undefined;

    return this.toSentMessage(message, {
      messageType: 'contact',
      contacts,
    });
  }

  async sendReaction(
    to: string,
    target: IMessageReference,
    emoji: string | null
  ): Promise<ISentMessage | undefined> {
    const message = await this.send(to, {
      react: { text: emoji, key: this.toBaileysMessageKey(target) },
    });

    if (!message) return undefined;

    return this.toSentMessage(message, {
      messageType: 'reaction',
      reaction: {
        emoji,
        targetMessageId: target.messageId ?? '',
      },
    });
  }

  async sendPoll(
    to: string,
    name: string,
    values: string[],
    selectableCount = 1,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined> {
    const message = await this.send(
      to,
      { poll: { name, values, selectableCount } },
      this.toBaileysOptions(options)
    );

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
    options?: IMessageSendOptions
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

  async deleteMessage(target: IMessageReference): Promise<void> {
    await this.send(target.chatId, { delete: this.toBaileysMessageKey(target) });
  }

  async editMessage(target: IMessageReference, text: string): Promise<ISentMessage | undefined> {
    const message = await this.send(target.chatId, {
      edit: this.toBaileysMessageKey(target),
      text,
    });

    if (!message) {
      return undefined;
    }

    return this.toSentMessage(message, { messageType: 'text', text });
  }

  async readMessages(keys: IMessageReference[]): Promise<void> {
    try {
      const messages = keys.map((message) => {
        return this.toBaileysMessageKey(message);
      });
      await this.socket.readMessages(messages);
    } catch (error) {
      throw new WhatsAppConnectionError('Failed to mark messages as read', { cause: error });
    }
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  private isValidJid(jid: string): boolean {
    const isValid =
      jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us') || jid.endsWith('@lid');
    if (!isValid) throw new BaileysError('Jid is not valid');

    return true;
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

  private toBaileysMessageKey(reference: IMessageReference): WAMessageKey {
    return {
      id: reference.messageId,
      remoteJid: reference.chatId,
      fromMe: reference.fromMe,
      participant: reference.participantId,
    };
  }

  private toBaileysOptions(
    options?: IMessageSendOptions,
    quotedMessage?: WAMessage
  ): MiscMessageGenerationOptions | undefined {
    if (!options && !quotedMessage) {
      return undefined;
    }
    return {
      messageId: options?.messageId,
      timestamp: options?.timestamp,
      ephemeralExpiration: options?.ephemeralExpiration,
      useCachedGroupMetadata: options?.useCachedGroupMetadata,
      quoted: quotedMessage,
    };
  }
}
