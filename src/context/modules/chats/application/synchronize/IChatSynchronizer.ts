import { IChat, IChatUpdate } from '@modules/chats/domain/IChat';

export interface IChatSynchronizer {
  syncChats(instanceId: string, chats: IChat[], isFullSync: boolean): Promise<void>;
  updateChats(instanceId: string, updates: IChatUpdate[]): Promise<void>;
  deleteChats(instanceId: string, chatIds: string[]): Promise<void>;
}
