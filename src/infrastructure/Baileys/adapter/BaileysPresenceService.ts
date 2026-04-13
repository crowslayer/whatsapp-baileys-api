import { WASocket } from '@whiskeysockets/baileys';

import { IPresenceService } from '@infrastructure/baileys/adapter/IPresenceService';

import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

export class BaileysPresenceService implements IPresenceService {
  constructor(private readonly socket: WASocket) {}

  /**
   * Suscribe a actualizaciones de presencia (online/offline/typing) de un JID.
   * Las actualizaciones llegan por el evento presence.update → onPresenceUpdate.
   */
  async subscribePresence(jid: string): Promise<void> {
    try {
      if (this.isValidJid(jid)) throw new Error('Jid is not valid');
      await this.socket.presenceSubscribe(jid);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to subscribe to presence for instance`, error);
    }
  }

  /**
   * Publica el estado de presencia propio en un chat (composing, recording, paused).
   */
  async sendPresence(
    jid: string,
    type: 'unavailable' | 'available' | 'composing' | 'recording' | 'paused'
  ): Promise<void> {
    try {
      if (this.isValidJid(jid)) throw new Error('Jid is not valid');
      await this.socket.sendPresenceUpdate(type, jid);
    } catch (error) {
      throw new WhatsAppConnectionError(`Failed to update presence for instance `, error);
    }
  }

  private isValidJid(jid: string): boolean {
    return jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us') || jid.endsWith('@lid');
  }
}
