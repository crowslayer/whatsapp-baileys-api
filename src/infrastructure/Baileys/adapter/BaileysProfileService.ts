import { USyncQueryResultList, WABusinessProfile, WASocket } from '@whiskeysockets/baileys';

import { IProfileService } from '@infrastructure/baileys/adapter/IProfileService';

import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

export class BaileysProfileService implements IProfileService {
  constructor(private readonly socket: WASocket) {}

  /**
   * Obtiene la URL de la foto de perfil de un JID (usuario o grupo).
   * @param type 'image' para alta resolución, undefined para baja.
   */
  async getProfilePictureUrl(jid: string, type?: 'image'): Promise<string | undefined> {
    try {
      if (!this.isValidJid(jid)) {
        throw new WhatsAppConnectionError(`Invalid JID: ${jid}`);
      }
      return await this.socket.profilePictureUrl(jid, type);
    } catch {
      // WA lanza error si el contacto no tiene foto o bloqueó el acceso
      return undefined;
    }
  }

  /**
   * Obtiene el estado/bio de texto de un JID.
   */
  async getStatus(jid: string): Promise<USyncQueryResultList[] | undefined> {
    try {
      if (!this.isValidJid(jid)) {
        throw new WhatsAppConnectionError(`Invalid JID: ${jid}`);
      }
      return await this.socket.fetchStatus(jid);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to fetch status for instance `, error);
    }
  }

  /**
   * Verifica si uno o más números están registrados en WhatsApp.
   * Retorna el JID canónico (puede ser LID en v7) si existe.
   */
  async checkWhatsAppNumber(
    jids: string | string[]
  ): Promise<Array<{ jid: string; exists: boolean }>> {
    try {
      const result = await this.socket.onWhatsApp(...(Array.isArray(jids) ? jids : [jids]));
      if (!result) throw new Error('Not found');
      return result.map((r) => ({ jid: r.jid, exists: r.exists }));
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to check WhatsApp numbers for instance `, error);
    }
  }

  /**
   * Actualiza la foto de perfil propia o de un grupo del que se es admin.
   */
  async updateProfilePicture(jid: string, image: Buffer | { url: string }): Promise<void> {
    try {
      if (!this.isValidJid(jid)) {
        throw new WhatsAppConnectionError(`Invalid JID: ${jid}`);
      }
      await this.socket.updateProfilePicture(jid, image);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to update profile picture for instance`, error);
    }
  }

  /**
   * Actualiza el nombre de perfil propio.
   */
  async updateProfileName(name: string): Promise<void> {
    try {
      await this.socket.updateProfileName(name);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to update profile name for instance `, error);
    }
  }

  /**
   * Obtiene el perfil de negocio de un JID (solo cuentas Business).
   */
  async getBusinessProfile(jid: string): Promise<WABusinessProfile | void> {
    try {
      if (!this.isValidJid(jid)) {
        throw new WhatsAppConnectionError(`Invalid JID: ${jid}`);
      }
      return await this.socket.getBusinessProfile(jid);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to get business profile for instance`, error);
    }
  }

  private isValidJid(jid: string): boolean {
    return jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us') || jid.endsWith('@lid');
  }
}
