import { InconmingWhatsAppMessage } from '@domain/events/InconmingWhatsAppMessage';

import { IBotService } from '@application/bot/types/IBotService';

import { IDomainEventSubscriber } from '@shared/domain/IDomainEventSubscriber';

export class MessageReceivedSubscriber implements IDomainEventSubscriber<InconmingWhatsAppMessage> {
  constructor(private readonly botService: IBotService) {}

  subscribedTo(): [typeof InconmingWhatsAppMessage] {
    return [InconmingWhatsAppMessage];
  }

  async on(event: InconmingWhatsAppMessage): Promise<void> {
    await this.botService.handleMessage(event.payload);
  }
}
