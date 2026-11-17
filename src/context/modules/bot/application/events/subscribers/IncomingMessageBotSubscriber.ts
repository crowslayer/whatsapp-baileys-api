import { IEventSubscriber } from '@shared/domain/event/IEventSubscriber';

import { IBotService } from '@modules/bot/domain/types/IBotService';
import { IncomingWhatsAppMessage } from '@modules/messages/domain/events/IncomingWhatsAppMessage';

export class IncomingMessageBotSubscriber implements IEventSubscriber<IncomingWhatsAppMessage> {
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
