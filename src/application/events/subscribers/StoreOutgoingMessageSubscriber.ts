import { OutgoingWhatsAppMessage } from '@domain/events/OutgoingWhatsAppMessage';
import { MessageAggregate } from '@domain/messages/MessageAggregate';
import { IMessageRepository } from '@domain/repositories/IMessageRepository';

import { IDomainEventSubscriber } from '@shared/domain/IDomainEventSubscriber';

export class StoreOutgoingMessageSubscriber implements IDomainEventSubscriber<OutgoingWhatsAppMessage> {
  constructor(private readonly messageRepository: IMessageRepository) {}

  subscribedTo(): [typeof OutgoingWhatsAppMessage] {
    return [OutgoingWhatsAppMessage];
  }

  async on(event: OutgoingWhatsAppMessage): Promise<void> {
    await this.messageRepository.save(
      MessageAggregate.create({
        messageId: event.payload.messageId,
        instanceId: event.payload.instanceId,
        chatId: event.payload.chatId,
        senderId: event.payload.senderId,
        direction: 'outgoing',
        content: event.payload.content,
        status: 'sent',
        timestamp: event.payload.timestamp,
        createdAt: new Date(event.payload.timestamp),
      })
    );
  }
}
