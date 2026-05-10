import { USyncQueryResultList, WABusinessProfile } from '@whiskeysockets/baileys';

export interface IProfileService {
  getProfilePictureUrl(jid: string, type?: 'image'): Promise<string | undefined>;
  getStatus(jid: string): Promise<USyncQueryResultList[] | undefined>;
  checkWhatsAppNumber(jids: string | string[]): Promise<Array<{ jid: string; exists: boolean }>>;
  updateProfilePicture(jid: string, image: Buffer | { url: string }): Promise<void>;
  updateProfileName(name: string): Promise<void>;
  getBusinessProfile(jid: string): Promise<WABusinessProfile | void>;
}
