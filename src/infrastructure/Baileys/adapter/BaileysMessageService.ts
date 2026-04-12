import { WAMessage, WASocket } from '@whiskeysockets/baileys';

export class BaileysMessageService {
  constructor(private readonly socket: WASocket) {}

  async sendText(to: string, text: string): Promise<WAMessage | undefined> {
    return this.socket.sendMessage(to, { text });
  }

  async sendImage(to: string, url: string, caption?: string): Promise<WAMessage | undefined> {
    return this.socket.sendMessage(to, {
      image: { url },
      caption,
    });
  }
}
