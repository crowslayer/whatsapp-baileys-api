import { AnyMessageContent, LastMessageList, WASocket } from '@whiskeysockets/baileys';

import { IChatStateService } from '@infrastructure/baileys/adapter/IChatStateService';

import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

export class BaileysChatStateService implements IChatStateService {
  constructor(private readonly socket: WASocket) {}

  /**
   * Archiva o desarchiva un chat.
   */
  async archiveChat(jid: string, archive: boolean): Promise<void> {
    try {
      if (!this.isValidJid(jid)) {
        throw new Error('Jid invalid');
      }
      await this.socket.chatModify({ archive, lastMessages: [] }, jid);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to archive chat for ${jid}`, error);
    }
  }

  /**
   * Silencia o activa las notificaciones de un chat.
   * @param until timestamp Unix en ms hasta cuando silenciar; null para reactivar.
   */
  async muteChat(jid: string, until: number | null): Promise<void> {
    try {
      if (!this.isValidJid(jid)) {
        throw new Error('Jid invalid');
      }
      await this.socket.chatModify({ mute: until }, jid);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to mute chat for instance ${jid}`, error);
    }
  }

  /**
   * Marca un chat como leído o no leído.
   */
  async markChatRead(jid: string, lastMessages: LastMessageList, read: boolean): Promise<void> {
    try {
      if (!this.isValidJid(jid)) {
        throw new Error('Jid invalid');
      }
      await this.socket.chatModify({ markRead: read, lastMessages }, jid);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to mark chat as read for instance ${jid}`, error);
    }
  }

  /**
   * Fija o desfija un chat en la lista principal.
   */
  async pinChat(jid: string, pin: boolean): Promise<void> {
    try {
      if (!this.isValidJid(jid)) {
        throw new Error('Jid invalid');
      }
      await this.socket.chatModify({ pin }, jid);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to pin chat for instance ${jid}`, error);
    }
  }

  /**
   * Activa o desactiva mensajes temporales (disappearing) en un chat.
   * @param expiration segundos. 0 para desactivar. Valores típicos: 86400 (1d), 604800 (7d), 7776000 (90d).
   */
  async setDisappearingMessages(jid: string, expiration: number): Promise<void> {
    try {
      if (!this.isValidJid(jid)) {
        throw new Error('Jid invalid');
      }
      await this.socket.sendMessage(jid, {
        disappearingMessagesInChat: expiration,
      } as AnyMessageContent);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to set disappearing messages for instance ${jid}`,
        error
      );
    }
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  private isValidJid(jid: string): boolean {
    return jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us') || jid.endsWith('@lid');
  }
}
