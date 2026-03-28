import { ChatAggregate } from '@domain/aggregates/ChatAggregate';

export interface IChatRepository {
  save(chat: ChatAggregate): Promise<void>;
  saveMany(chats: ChatAggregate[]): Promise<void>;

  findById(chatId: string, instanceId: string): Promise<ChatAggregate | null>;

  /** All chats belonging to a given WhatsApp instance. */
  findByInstance(instanceId: string): Promise<ChatAggregate[]>;

  /** Only individual (non-group) chats for a given instance. */
  findIndividualByInstance(instanceId: string): Promise<ChatAggregate[]>;

  /** Only group chats for a given instance. */
  findGroupsByInstance(instanceId: string): Promise<ChatAggregate[]>;

  update(chat: ChatAggregate): Promise<void>;
  upsert(chat: ChatAggregate): Promise<void>;
  upsertMany(chats: ChatAggregate[]): Promise<void>;

  delete(chatId: string, instanceId: string): Promise<void>;
  deleteByInstance(instanceId: string): Promise<void>;

  exists(chatId: string, instanceId: string): Promise<boolean>;
  countByInstance(instanceId: string): Promise<number>;
}
