import { IEventSubscriber } from '@shared/domain/event/IEventSubscriber';

import { ChatId } from '@modules/chats/domain/ChatId';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { OutgoingWhatsAppMessage } from '@modules/messages/domain/events/OutgoingWhatsAppMessage';
import { IMessageRepository } from '@modules/messages/domain/IMessageRepository';
import { MessageAggregate } from '@modules/messages/domain/MessageAggregate';
import { MessageId } from '@modules/messages/domain/MessageId';
import { CreatedAt } from '@modules/shared/domain/CreatedAt';

export class StoreOutgoingMessageSubscriber implements IEventSubscriber<OutgoingWhatsAppMessage> {
  constructor(private readonly messageRepository: IMessageRepository) {}

  subscribedTo(): [typeof OutgoingWhatsAppMessage] {
    return [OutgoingWhatsAppMessage];
  }

  async on(event: OutgoingWhatsAppMessage): Promise<void> {
    await this.messageRepository.save(
      MessageAggregate.create({
        messageId: MessageId.fromString(event.payload.messageId),
        instanceId: InstanceId.fromString(event.payload.instanceId),
        chatId: ChatId.fromString(event.payload.chatId),
        senderId: event.payload.senderId,
        direction: 'outgoing',
        content: event.payload.content,
        status: 'sent',
        timestamp: event.payload.timestamp,
        createdAt: CreatedAt.create(event.payload.timestamp),
      })
    );
  }
}
