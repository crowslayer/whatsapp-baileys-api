import { WAPrivacyGroupAddValue, WAPrivacyValue, WASocket } from '@whiskeysockets/baileys';

import { IPrivacyService } from '@infrastructure/baileys/adapter/IPrivacyService';

import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

export class BaileysPrivacyService implements IPrivacyService {
  constructor(private readonly socket: WASocket) {}

  /**
   * Bloquea o desbloquea un JID.
   */
  async updateBlockStatus(jid: string, action: 'block' | 'unblock'): Promise<void> {
    try {
      if (!this.isValidJid(jid)) {
        throw new Error('Jid invalid');
      }
      await this.socket.updateBlockStatus(jid, action);
    } catch (error) {
      throw new WhatsAppConnectionError(
        `Failed to update block status for instance ${jid}}`,
        error
      );
    }
  }

  /**
   * Obtiene la lista completa de JIDs bloqueados.
   */
  async fetchBlocklist(): Promise<(string | undefined)[]> {
    try {
      return await this.socket.fetchBlocklist();
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to fetch blocklist for instance`, error);
    }
  }

  /**
   * Obtiene la configuración de privacidad actual.
   */
  async fetchPrivacySettings(): Promise<Record<string, string>> {
    try {
      return await this.socket.fetchPrivacySettings(true);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to fetch privacy settings`, error);
    }
  }

  /**
   * Actualiza la privacidad del último visto.
   */
  async updateLastSeenPrivacy(
    value: 'all' | 'contacts' | 'contacts_blacklist' | 'none'
  ): Promise<void> {
    await this.socket.updateLastSeenPrivacy(value as WAPrivacyValue);
  }

  /**
   * Actualiza la privacidad de la foto de perfil.
   */
  async updateProfilePicturePrivacy(
    value: 'all' | 'contacts' | 'contacts_blacklist' | 'none'
  ): Promise<void> {
    await this.socket.updateProfilePicturePrivacy(value as WAPrivacyValue);
  }

  /**
   * Actualiza la privacidad del estado/bio.
   */
  async updateStatusPrivacy(
    value: 'all' | 'contacts' | 'contacts_blacklist' | 'none'
  ): Promise<void> {
    await this.socket.updateStatusPrivacy(value as WAPrivacyValue);
  }

  /**
   * Actualiza la privacidad de lectura de mensajes (doble check azul).
   */
  async updateReadReceiptsPrivacy(value: 'all' | 'none'): Promise<void> {
    await this.socket.updateReadReceiptsPrivacy(value);
  }

  /**
   * Actualiza quién puede agregar a grupos.
   */
  async updateGroupsAddPrivacy(
    value: 'all' | 'contacts' | 'contacts_blacklist' | 'none'
  ): Promise<void> {
    await this.socket.updateGroupsAddPrivacy(value as WAPrivacyGroupAddValue);
  }

  /**
   * Actualiza la privacidad del estado online.
   */
  async updateOnlinePrivacy(value: 'all' | 'match_last_seen'): Promise<void> {
    await this.socket.updateOnlinePrivacy(value);
  }

  private isValidJid(jid: string): boolean {
    return jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us') || jid.endsWith('@lid');
  }
}
