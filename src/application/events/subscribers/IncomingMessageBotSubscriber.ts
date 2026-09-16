import { IncomingWhatsAppMessage } from '@domain/events/IncomingWhatsAppMessage';

import { IBotService } from '@application/bot/types/IBotService';

import { IDomainEventSubscriber } from '@shared/domain/IDomainEventSubscriber';

export class IncomingMessageBotSubscriber implements IDomainEventSubscriber<IncomingWhatsAppMessage> {
  constructor(private readonly botService: IBotService) {}

  subscribedTo(): [typeof IncomingWhatsAppMessage] {
    return [IncomingWhatsAppMessage];
  }

  async on(event: IncomingWhatsAppMessage): Promise<void> {
    if (event.payload.content.messageType === 'text') {
      await this.botService.handleMessage({
        instanceId: event.payload.instanceId,
        conversationId: event.payload.chatId,
        messageId: event.payload.messageId,
        senderId: event.payload.senderId,
        text: event.payload.content.text,
      });
    }
  }
}
