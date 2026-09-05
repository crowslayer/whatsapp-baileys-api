import { WAMessage } from '@whiskeysockets/baileys/lib/Types/Message';

import { MessageContent, MessagePayload } from '@domain/messages/MessagePayload';

export class BaileysMessageMapper {
  static toIncomingMessage(instanceId: string, message: WAMessage): MessagePayload | null {
    if (message.key.fromMe) {
      return null;
    }

    const content = BaileysMessageMapper.mapContent(message);

    if (content === null) return null;

    return {
      instanceId,
      chatId: message.key.remoteJid ?? message.key.remoteJidAlt ?? '',
      messageId: message.key.id ?? '',
      from: message.key.participant ?? message.key.remoteJid ?? '',
      timestamp: new Date(Number(message.messageTimestamp) * 1000),
      content,
    };
  }

  private static mapContent(message: WAMessage): MessageContent | null {
    const msg = message.message;

    if (!msg) {
      return null;
    }

    if (msg.conversation) {
      return {
        messageType: 'text',
        text: msg.conversation,
      };
    }

    if (msg.extendedTextMessage?.text) {
      return {
        messageType: 'text',
        text: msg.extendedTextMessage.text,
      };
    }

    if (msg.imageMessage) {
      return {
        messageType: 'image',
        caption: msg.imageMessage.caption ?? undefined,
        media: {
          mimeType: msg.imageMessage.mimetype ?? undefined,
          fileLength: msg.imageMessage.fileLength ? Number(msg.imageMessage.fileLength) : undefined,
        },
      };
    }

    if (msg.audioMessage) {
      return {
        messageType: 'audio',
        media: {
          mimeType: msg.audioMessage.mimetype ?? undefined,
          fileLength: msg.audioMessage.fileLength ? Number(msg.audioMessage.fileLength) : undefined,
          duration: msg.audioMessage.seconds ?? undefined,
          ptt: msg.audioMessage.ptt ?? undefined,
        },
      };
    }

    return null;
  }
}
