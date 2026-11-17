import { IEventSubscriber } from '@shared/domain/event/IEventSubscriber';

import { ChatId } from '@modules/chats/domain/ChatId';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { IncomingWhatsAppMessage } from '@modules/messages/domain/events/IncomingWhatsAppMessage';
import { IMessageRepository } from '@modules/messages/domain/IMessageRepository';
import { MessageAggregate } from '@modules/messages/domain/MessageAggregate';
import { MessageId } from '@modules/messages/domain/MessageId';
import { CreatedAt } from '@modules/shared/domain/CreatedAt';

export class StoreIncomingMessageSubscriber implements IEventSubscriber<IncomingWhatsAppMessage> {
  constructor(private readonly messageRepository: IMessageRepository) {}

  subscribedTo(): [typeof IncomingWhatsAppMessage] {
    return [IncomingWhatsAppMessage];
  }

  async on(event: IncomingWhatsAppMessage): Promise<void> {
    await this.messageRepository.save(
      MessageAggregate.create({
        messageId: MessageId.fromString(event.payload.messageId),
        instanceId: InstanceId.fromString(event.payload.instanceId),
        chatId: ChatId.fromString(event.payload.chatId),
        senderId: event.payload.senderId,
        direction: 'incoming',
        content: event.payload.content,
        timestamp: event.payload.timestamp,
        createdAt: CreatedAt.create(event.payload.timestamp),
      })
    );
  }
}
