import { LastMessageList } from '@whiskeysockets/baileys';

export interface IChatStateService {
  archiveChat(jid: string, archive: boolean): Promise<void>;
  muteChat(jid: string, until: number | null): Promise<void>;
  markChatRead(jid: string, lastMessages: LastMessageList, read: boolean): Promise<void>;
  pinChat(jid: string, pin: boolean): Promise<void>;
  setDisappearingMessages(jid: string, expiration: number): Promise<void>;
}
