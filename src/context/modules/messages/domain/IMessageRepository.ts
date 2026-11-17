import { InstanceId } from '@modules/instances/domain/InstanceId';
import { MessageAggregate } from '@modules/messages/domain/MessageAggregate';
import { MessageId } from '@modules/messages/domain/MessageId';

export interface IMessageRepository {
  save(message: MessageAggregate): Promise<void>;

  saveMany(messages: MessageAggregate[]): Promise<void>;

  upsert(message: MessageAggregate): Promise<void>;

  updateStatus(
    instanceId: InstanceId,
    messageId: MessageId,
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  ): Promise<void>;
}
