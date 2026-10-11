import { WAMessage } from '@whiskeysockets/baileys';

import {
  IMessageReference,
  IMessageSendOptions,
  ISentMessage,
} from '@domain/messages/MessageTypes';

export interface IMessageService {
  sendText(
    to: string,
    text: string,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined>;

  sendImage(
    to: string,
    image: Buffer | { url: string },
    caption?: string,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined>;

  sendVideo(
    to: string,
    video: Buffer | { url: string },
    caption?: string,
    gifPlayback?: boolean,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined>;

  sendAudio(
    to: string,
    audio: Buffer | { url: string },
    ptt: boolean,
    mimetype: string,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined>;

  sendDocument(
    to: string,
    document: Buffer | { url: string },
    fileName: string,
    mimetype: string,
    caption?: string,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined>;

  sendSticker(
    to: string,
    sticker: Buffer | { url: string },
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined>;

  sendLocation(
    to: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined>;

  sendContact(
    to: string,
    contacts: Array<{ displayName: string; vcard: string }>,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined>;

  sendReaction(
    to: string,
    key: IMessageReference,
    emoji: string
  ): Promise<ISentMessage | undefined>;

  sendPoll(
    to: string,
    name: string,
    values: string[],
    selectableCount: number,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined>;

  forwardMessage(
    to: string,
    message: WAMessage,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined>;

  deleteMessage(target: IMessageReference): Promise<void>;
  editMessage(target: IMessageReference, text: string): Promise<ISentMessage | undefined>;

  readMessages(keys: IMessageReference[]): Promise<void>;
}
