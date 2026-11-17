import { WebhookService } from '@apps/backend/http/webhooks/WebhookService';

import { IEventBus } from '@shared/domain/event/IEventBus';
import { ILogger } from '@shared/domain/Logger';

import { IChatSynchronizer } from '@modules/chats/application/synchronize/IChatSynchronizer';
import { BaileysEventHandlers } from '@modules/instances/application/events/BaileysEventHandlers';
import { IConnectionStateStore } from '@modules/instances/application/runtime/IConnectionStateStore';
import { WhatsAppInstanceRuntime } from '@modules/instances/application/runtime/WhatsAppInstanceRuntime';
import { IConnectionEventBus } from '@modules/instances/domain/IConnectionEventBus';
import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';

export class WhatsAppRuntimeFactory {
  constructor(
    private readonly repository: IInstanceRepository,
    private readonly syncService: IChatSynchronizer,
    private readonly webhookService: WebhookService,
    private readonly logger: ILogger,
    private readonly connectionStore: IConnectionStateStore,
    private readonly eventBus: IConnectionEventBus,
    private readonly domainEventBus: IEventBus
  ) {}

  create(instance: InstanceAggregate): WhatsAppInstanceRuntime {
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
      this.eventBus, // usando eventbus
      this.domainEventBus // domainEvent
    );
  }
}
