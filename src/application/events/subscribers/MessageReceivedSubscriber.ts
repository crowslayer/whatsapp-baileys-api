import { MessageReceivedEvent } from '@domain/events/MessageReceivedEvent';

import { IBotService } from '@application/bot/types/IBotService';

import { IDomainEventSubscriber } from '@shared/domain/IDomainEventSubscriber';

export class MessageReceivedSubscriber implements IDomainEventSubscriber<MessageReceivedEvent> {
  constructor(private readonly botService: IBotService) {}

  subscribedTo(): [typeof MessageReceivedEvent] {
    return [MessageReceivedEvent];
  }

  async on(event: MessageReceivedEvent): Promise<void> {
    console.log('Message received:', event.eventId);
    const { chatId, message, instanceId } = event.payload;

    await this.botService.handleMessage(instanceId, chatId, message);
  }
}
