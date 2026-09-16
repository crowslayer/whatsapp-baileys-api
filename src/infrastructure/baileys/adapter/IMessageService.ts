import { MiscMessageGenerationOptions, WAMessage, WAMessageKey } from '@whiskeysockets/baileys';

import { ISentMessage } from '@domain/messages/MessageTypes';

export interface IMessageService {
  sendText(
    to: string,
    text: string,
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined>;

  sendImage(
    to: string,
    image: Buffer | { url: string },
    caption?: string,
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined>;

  sendVideo(
    to: string,
    video: Buffer | { url: string },
    caption?: string,
    gifPlayback?: boolean,
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined>;

  sendAudio(
    to: string,
    audio: Buffer | { url: string },
    ptt: boolean,
    mimetype: string,
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined>;

  sendDocument(
    to: string,
    document: Buffer | { url: string },
    fileName: string,
    mimetype: string,
    caption?: string,
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined>;

  sendSticker(
    to: string,
    sticker: Buffer | { url: string },
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined>;

  sendLocation(
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string,
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined>;

  sendContact(
    to: string,
    contacts: Array<{ displayName: string; vcard: string }>,
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined>;

  sendReaction(to: string, key: WAMessageKey, emoji: string): Promise<ISentMessage | undefined>;

  sendPoll(
    to: string,
    name: string,
    values: string[],
    selectableCount: number,
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined>;

  forwardMessage(
    to: string,
    message: WAMessage,
    options?: MiscMessageGenerationOptions
  ): Promise<ISentMessage | undefined>;

  deleteMessage(to: string, key: WAMessageKey): Promise<void>;
  editMessage(to: string, key: WAMessageKey, text: string): Promise<WAMessage | undefined>;

  readMessages(keys: WAMessageKey[]): Promise<void>;
}
