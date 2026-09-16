import { IncomingWhatsAppMessage } from '@domain/events/IncomingWhatsAppMessage';
import { MessageAggregate } from '@domain/messages/MessageAggregate';
import { IMessageRepository } from '@domain/repositories/IMessageRepository';

import { IDomainEventSubscriber } from '@shared/domain/IDomainEventSubscriber';

export class StoreIncomingMessageSubscriber implements IDomainEventSubscriber<IncomingWhatsAppMessage> {
  constructor(private readonly messageRepository: IMessageRepository) {}

  subscribedTo(): [typeof IncomingWhatsAppMessage] {
    return [IncomingWhatsAppMessage];
  }

  async on(event: IncomingWhatsAppMessage): Promise<void> {
    await this.messageRepository.save(
      MessageAggregate.create({
        messageId: event.payload.messageId,
        instanceId: event.payload.instanceId,
        chatId: event.payload.chatId,
        senderId: event.payload.senderId,
        direction: 'incoming',
        content: event.payload.content,
        timestamp: event.payload.timestamp,
        createdAt: new Date(event.payload.timestamp),
      })
    );
  }
}
