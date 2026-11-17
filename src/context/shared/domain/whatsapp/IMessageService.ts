import {
  IMessageReference,
  IMessageSendOptions,
  ISentMessage,
} from '@shared/domain/whatsapp/MessageTypes';

type RequestFile =
  | { buffer: Buffer; mimetype: string; filename: string; originalname: string; path: string }
  | { url: string };

export interface IMessageService {
  sendText(
    to: string,
    text: string,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined>;

  sendImage(
    to: string,
    image: RequestFile,
    caption?: string,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined>;

  sendVideo(
    to: string,
    video: RequestFile,
    caption?: string,
    gifPlayback?: boolean,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined>;

  sendAudio(
    to: string,
    audio: RequestFile,
    ptt: boolean,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined>;

  sendDocument(
    to: string,
    document: RequestFile,
    fileName: string,
    caption?: string,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined>;

  sendSticker(
    to: string,
    sticker: RequestFile,
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
    emoji: string | null
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
    message: unknown,
    options?: IMessageSendOptions
  ): Promise<ISentMessage | undefined>;

  deleteMessage(target: IMessageReference): Promise<void>;
  editMessage(target: IMessageReference, text: string): Promise<ISentMessage | undefined>;

  readMessages(keys: IMessageReference[]): Promise<void>;
}
