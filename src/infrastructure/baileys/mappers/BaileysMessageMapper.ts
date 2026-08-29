import { WAMessage } from '@whiskeysockets/baileys/lib/Types/Message';

type IncomingMessageDTO = {
  instanceId: string;
  chatId: string;
  messageId: string;
  from: string;
  text: string;
  timestamp: Date;
};

export class BaileysMessageMapper {
  static toIncomingMessage(instanceId: string, message: WAMessage): IncomingMessageDTO | null {
    if (message.key.fromMe) {
      return null;
    }

    const text =
      message.message?.conversation ??
      message.message?.extendedTextMessage?.text ??
      message.message?.imageMessage?.caption;

    if (!text) {
      return null;
    }

    return {
      instanceId,
      chatId: message.key.remoteJid ?? message.key.remoteJidAlt ?? '',
      messageId: message.key.id ?? '',
      from: message.key.participant ?? message.key.remoteJid ?? '',
      text,
      timestamp: new Date(Number(message.messageTimestamp) * 1000),
    };
  }
}
