import { MiscMessageGenerationOptions, WAMessage, WAMessageKey } from '@whiskeysockets/baileys';

export interface IMessageService {
  sendText(
    to: string,
    text: string,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined>;

  sendImage(
    to: string,
    image: Buffer | { url: string },
    caption?: string,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined>;

  sendVideo(
    to: string,
    video: Buffer | { url: string },
    caption?: string,
    gifPlayback?: boolean,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined>;

  sendAudio(
    to: string,
    audio: Buffer | { url: string },
    ptt: boolean,
    mimetype: string,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined>;

  sendDocument(
    to: string,
    document: Buffer | { url: string },
    fileName: string,
    mimetype: string,
    caption?: string,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined>;

  sendSticker(
    to: string,
    sticker: Buffer | { url: string },
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined>;

  sendLocation(
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined>;

  sendContact(
    to: string,
    contacts: Array<{ displayName: string; vcard: string }>,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined>;

  sendReaction(to: string, key: WAMessageKey, emoji: string): Promise<WAMessage | undefined>;

  sendPoll(
    to: string,
    name: string,
    values: string[],
    selectableCount: number,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined>;

  forwardMessage(
    to: string,
    message: WAMessage,
    options?: MiscMessageGenerationOptions
  ): Promise<WAMessage | undefined>;

  deleteMessage(to: string, key: WAMessageKey): Promise<void>;
  editMessage(to: string, key: WAMessageKey, text: string): Promise<WAMessage | undefined>;

  readMessages(keys: WAMessageKey[]): Promise<void>;
}
