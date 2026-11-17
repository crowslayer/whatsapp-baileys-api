import { IChat } from '@modules/chats/domain/IChat';

export type ChatReadModel = IChat;

export interface IChatReadRepository {
  findById(chatId: string, instanceId: string): Promise<ChatReadModel | null>;

  /** All chats belonging to a given WhatsApp instance. */
  findByInstance(instanceId: string): Promise<ChatReadModel[]>;

  /** Only individual (non-group) chats for a given instance. */
  findChatsByInstance(instanceId: string): Promise<ChatReadModel[]>;

  /** Only group chats for a given instance. */
  findGroupsByInstance(instanceId: string): Promise<ChatReadModel[]>;
}
