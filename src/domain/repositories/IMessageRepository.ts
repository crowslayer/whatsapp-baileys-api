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
}
