import { WhatsAppInstanceAggregate } from '@domain/aggregates/WhatsAppInstanceAggregate';
import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { IChatSynchronizer } from '@application/chats/synchronize/IChatSynchronizer';
import { BaileysEventHandlers } from '@application/events/BaileysEventHandlers';
import { IConnectionEventBus } from '@application/events/IConnectionEventBus';
import { IConnectionStateStore } from '@application/runtime/IConnectionStateStore';
import { WhatsAppInstanceRuntime } from '@application/runtime/WhatsAppInstanceRuntime';

import { WebhookService } from '@infrastructure/http/webhooks/WebhookService';
import { ILogger } from '@infrastructure/loggers/Logger';

export class WhatsAppRuntimeFactory {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly syncService: IChatSynchronizer,
    private readonly webhookService: WebhookService,
    private readonly logger: ILogger,
    private readonly connectionStore: IConnectionStateStore,
    private readonly eventBus: IConnectionEventBus
  ) {}

  create(instance: WhatsAppInstanceAggregate): WhatsAppInstanceRuntime {
    const eventHandlers = new BaileysEventHandlers(
      instance,
      this.syncService,
      this.webhookService,
      this.logger
    );

    return new WhatsAppInstanceRuntime(
      instance,
      this.repository,
      eventHandlers,
      this.connectionStore,
      this.eventBus // usando eventbus
    );
  }
}
