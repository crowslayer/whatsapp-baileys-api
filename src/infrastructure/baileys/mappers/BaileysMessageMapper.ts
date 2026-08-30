import { WAMessage } from '@whiskeysockets/baileys/lib/Types/Message';

type MessageType = 'text' | 'image' | 'audio';

type IncomingMessageDTO = {
  instanceId: string;
  chatId: string;
  messageId: string;
  from: string;
  text: string;
  timestamp: Date;
  messageType?: MessageType;
};

export class BaileysMessageMapper {
  static toIncomingMessage(instanceId: string, message: WAMessage): IncomingMessageDTO | null {
    if (message.key.fromMe) {
      return null;
    }

    const text =
      message.message?.conversation ??
      message.message?.extendedTextMessage?.text ??
      message.message?.imageMessage?.caption ??
      '';

    if (!text) {
      return null;
    }

    const type = BaileysMessageMapper.getMessageType(message);

    return {
      instanceId,
      chatId: message.key.remoteJid ?? message.key.remoteJidAlt ?? '',
      messageId: message.key.id ?? '',
      from: message.key.participant ?? message.key.remoteJid ?? '',
      text,
      timestamp: new Date(Number(message.messageTimestamp) * 1000),
      messageType: type ?? undefined,
    };
  }

  static getMessageType(msg: WAMessage): MessageType | null {
    const message = msg.message;

    if (!message) return null;

    if (message.conversation || message.extendedTextMessage) {
      return 'text';
    }

    if (message.imageMessage) {
      return 'image';
    }

    if (message.audioMessage) {
      return 'audio';
    }

    return null;
  }
}
