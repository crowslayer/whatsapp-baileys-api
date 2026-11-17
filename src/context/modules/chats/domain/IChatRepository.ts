import { ChatAggregate } from '@modules/chats/domain/ChatAggregate';
import { ChatId } from '@modules/chats/domain/ChatId';
import { InstanceId } from '@modules/instances/domain/InstanceId';

export interface IChatRepository {
  save(chat: ChatAggregate): Promise<void>;
  saveMany(chats: ChatAggregate[]): Promise<void>;

  findById(chatId: ChatId, instanceId: InstanceId): Promise<ChatAggregate>;

  update(chat: ChatAggregate): Promise<void>;
  upsert(chat: ChatAggregate): Promise<void>;
  upsertMany(chats: ChatAggregate[]): Promise<void>;

  delete(chatId: string, instanceId: string): Promise<void>;
  deleteByInstance(instanceId: string): Promise<void>;
}
