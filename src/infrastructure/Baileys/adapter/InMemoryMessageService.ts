import { IMessageService } from './IMessageService';
import { WAMessage, WAMessageKey, MiscMessageGenerationOptions } from '@whiskeysockets/baileys';

export class InMemoryMessageService implements IMessageService {
  async sendText(to: string, text: string, _options?: MiscMessageGenerationOptions): Promise<WAMessage | undefined> {
    console.log(`Bot reply to ${to}: ${text}`);
    return undefined;
  }

  async sendImage(to: string, image: Buffer | { url: string }, caption?: string, _options?: MiscMessageGenerationOptions): Promise<WAMessage | undefined> {
    return undefined;
  }
  async sendVideo(to: string, video: Buffer | { url: string }, caption?: string, gifPlayback?: boolean, _options?: MiscMessageGenerationOptions): Promise<WAMessage | undefined> {
    return undefined;
  }
  async sendAudio(to: string, audio: Buffer | { url: string }, ptt: boolean, mimetype: string, _options?: MiscMessageGenerationOptions): Promise<WAMessage | undefined> {
    return undefined;
  }
  async sendDocument(to: string, document: Buffer | { url: string }, fileName: string, mimetype: string, caption?: string, _options?: MiscMessageGenerationOptions): Promise<WAMessage | undefined> {
    return undefined;
  }
  async sendSticker(to: string, sticker: Buffer | { url: string }, _options?: MiscMessageGenerationOptions): Promise<WAMessage | undefined> {
    return undefined;
  }
  async sendLocation(to: string, latitude: number, longitude: number, name?: string, address?: string, _options?: MiscMessageGenerationOptions): Promise<WAMessage | undefined> {
    return undefined;
  }
  async sendContact(to: string, contacts: Array<{ displayName: string; vcard: string }>, _options?: MiscMessageGenerationOptions): Promise<WAMessage | undefined> {
    return undefined;
  }
  async sendReaction(to: string, key: WAMessageKey, emoji: string): Promise<WAMessage | undefined> {
    return undefined;
  }
  async sendPoll(to: string, name: string, values: string[], selectableCount: number, _options?: MiscMessageGenerationOptions): Promise<WAMessage | undefined> {
    return undefined;
  }
  async forwardMessage(to: string, message: WAMessage, _options?: MiscMessageGenerationOptions): Promise<WAMessage | undefined> {
    return undefined;
  }
  async deleteMessage(to: string, key: WAMessageKey): Promise<void> {
    return;
  }
  async editMessage(to: string, key: WAMessageKey, text: string): Promise<WAMessage | undefined> {
    return undefined;
  }
  async readMessages(keys: WAMessageKey[]): Promise<void> {
    return;
  }
}
