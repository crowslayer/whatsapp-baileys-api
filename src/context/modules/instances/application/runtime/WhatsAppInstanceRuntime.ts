import { EventId } from '@shared/domain/event/EventId';
import { IEventBus } from '@shared/domain/event/IEventBus';
import { IMessageService } from '@shared/domain/whatsapp/IMessageService';
import { IPresenceService } from '@shared/domain/whatsapp/IPresenceService';
import { IPrivacyService } from '@shared/domain/whatsapp/IPrivacyService';
import { IProfileService } from '@shared/domain/whatsapp/IProfileService';
import { IWhatsAppRuntime } from '@shared/domain/whatsapp/IWhatsAppRuntime';
import { BaileysChatStateService } from '@shared/infrastructure/baileys/adapter/BaileysChatStateService';
import { BaileysConnection } from '@shared/infrastructure/baileys/adapter/BaileysConnection';
import { BaileysEventRouter } from '@shared/infrastructure/baileys/adapter/BaileysEventRouter';
import { BaileysGroupsService } from '@shared/infrastructure/baileys/adapter/BaileysGroupsService';
import { BaileysMessageService } from '@shared/infrastructure/baileys/adapter/BaileysMessageService';
import { BaileysPresenceService } from '@shared/infrastructure/baileys/adapter/BaileysPresenceService';
import { BaileysPrivacyService } from '@shared/infrastructure/baileys/adapter/BaileysPrivacyService';
import { BaileysProfileService } from '@shared/infrastructure/baileys/adapter/BaileysProfileService';

import { IChatStateService } from '@modules/chats/application/IChatStateService';
import { IGroupService } from '@modules/groups/domain/IGroupService';
import { IBaileysEventHandlers } from '@modules/instances/application/events/IBaileysEventHandlers';
import { IConnectionStateStore } from '@modules/instances/application/runtime/IConnectionStateStore';
import { QRCodeGeneratedEvent } from '@modules/instances/domain/events/QRCodeGeneratedEvent';
import { IConnectionEventBus } from '@modules/instances/domain/IConnectionEventBus';
import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';

type DisconnectEvent = {
  type: 'TRANSIENT' | 'INVALID_SESSION' | 'LOGGED_OUT';
  reason?: string;
};

export class WhatsAppInstanceRuntime implements IWhatsAppRuntime {
  private _connection!: BaileysConnection;
  private _messaging!: IMessageService;
  private _groups!: IGroupService;
  private _presence!: IPresenceService;
  private _profile!: IProfileService;
  private _privacy!: IPrivacyService;
  private _chatState!: IChatStateService;
  private _disconnectHandler?: (event: DisconnectEvent) => void;

  constructor(
    private readonly instance: InstanceAggregate,
    private readonly repository: IInstanceRepository,
    private readonly eventHandlers: IBaileysEventHandlers,
    private readonly connectionStore: IConnectionStateStore,
    private readonly eventBus: IConnectionEventBus,
    private readonly domainEventBus: IEventBus
  ) {}

  async start(phoneNumber?: string): Promise<void> {
    this._connection = new BaileysConnection(this.instance.instanceId, this.eventBus);

    this.bindEvents();

    await this._connection.connect(phoneNumber);

    const socket = this._connection.getSocket();

    this._messaging = new BaileysMessageService(socket);
    this._groups = new BaileysGroupsService(socket);
    this._presence = new BaileysPresenceService(socket);
    this._profile = new BaileysProfileService(socket);
    this._chatState = new BaileysChatStateService(socket);
    this._privacy = new BaileysPrivacyService(socket);

    const router = new BaileysEventRouter(
      socket,
      this.instance,
      this.eventHandlers,
      this.domainEventBus
    );

    router.bind();
  }

  onDisconnect(handler: (event: DisconnectEvent) => void): void {
    this._disconnectHandler = handler;
  }

  async stop(): Promise<void> {
    await this._connection.disconnect();
  }

  get messaging(): IMessageService {
    return this._messaging;
  }

  get groups(): IGroupService {
    return this._groups;
  }

  get profile(): IProfileService {
    return this._profile;
  }

  get presence(): IPresenceService {
    return this._presence;
  }

  get privacy(): IPrivacyService {
    return this._privacy;
  }

  get chatState(): IChatStateService {
    return this._chatState;
  }

  // Metdo para usar eventos en lugar de callback
  private bindEvents(): void {
    this.eventBus.on('qr', async (data) => {
      if (data.instanceId !== this.instance.instanceId) return;
      // store efímero
      const event = QRCodeGeneratedEvent.create({
        aggregateId: data.instanceId,
        eventId: EventId.create().value,
        occurredOn: new Date(),
        payload: data,
      });
      this.domainEventBus.publish([event]);
    });

    this.eventBus.on('connected', async (data) => {
      if (data.instanceId !== this.instance.instanceId) return;

      this.instance.connect(data.phone);
      await this.repository.update(this.instance);

      await this.domainEventBus.publish(this.instance.pullDomainEvents());
      await this.connectionStore.clear(data.instanceId);
    });

    this.eventBus.on('disconnected', async (data) => {
      if (data.instanceId !== this.instance.instanceId) return;

      this.instance.disconnect(data.reason);
      await this.repository.update(this.instance);
      await this.domainEventBus.publish(this.instance.pullDomainEvents());
      this._disconnectHandler?.(data);
    });

    this.eventBus.on('pairingCode', async (data) => {
      if (data.instanceId !== this.instance.instanceId) return;

      await this.connectionStore.setPairingCode(data.instanceId, data.pairingCode);
    });
  }
}
