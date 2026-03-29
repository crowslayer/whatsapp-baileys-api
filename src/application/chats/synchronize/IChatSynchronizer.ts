import { IBaileysChat, IBaileysChatUpdate } from '@infrastructure/baileys/IBaileysChat';

export interface IChatSynchronizer {
  syncChats(instanceId: string, chats: IBaileysChat[], isFullSync: boolean): Promise<void>;
  updateChats(instanceId: string, updates: IBaileysChatUpdate[]): Promise<void>;
  deleteChats(instanceId: string, chatIds: string[]): Promise<void>;
}
