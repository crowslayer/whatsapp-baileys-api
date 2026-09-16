import { MessageAggregate } from '@domain/messages/MessageAggregate';

export interface IMessageRepository {
  save(message: MessageAggregate): Promise<void>;

  saveMany(messages: MessageAggregate[]): Promise<void>;

  upsert(message: MessageAggregate): Promise<void>;

  updateStatus(
    instanceId: string,
    messageId: string,
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  ): Promise<void>;

  findById(instanceId: string, messageId: string): Promise<MessageAggregate | null>;

  findByChat(
    instanceId: string,
    chatId: string,
    limit?: number,
    before?: Date
  ): Promise<MessageAggregate[]>;

  findLatestByChat(instanceId: string, chatId: string): Promise<MessageAggregate | null>;

  exists(instanceId: string, messageId: string): Promise<boolean>;

  countByChat(instanceId: string, chatId: string): Promise<number>;
}
