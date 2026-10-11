export interface IChatMessageReference {
  id: string;
  chatId: string;
  fromMe: boolean;
  participantId?: string;
  timestamp: number;
}

export interface IChatStateService {
  archiveChat(jid: string, archive: boolean): Promise<void>;
  muteChat(jid: string, until: number | null): Promise<void>;
  markChatRead(jid: string, lastMessages: IChatMessageReference[], read: boolean): Promise<void>;
  pinChat(jid: string, pin: boolean): Promise<void>;
  setDisappearingMessages(jid: string, expiration: number): Promise<void>;
}
