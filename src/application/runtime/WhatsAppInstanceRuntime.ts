import { WhatsAppInstanceAggregate } from '@domain/aggregates/WhatsAppInstanceAggregate';
import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { IBaileysEventHandlers } from '@application/events/IBaileysEventHandlers';
import { IConnectionEventBus } from '@application/events/IConnectionEventBus';
import { IConnectionStateStore } from '@application/runtime/IConnectionStateStore';
import { IWhatsAppRuntime } from '@application/runtime/IWhatsAppRuntime';

import { BaileysChatStateService } from '@infrastructure/baileys/adapter/BaileysChatStateService';
import { BaileysConnection } from '@infrastructure/baileys/adapter/BaileysConnection';
import { BaileysEventRouter } from '@infrastructure/baileys/adapter/BaileysEventRouter';
import { BaileysGroupsService } from '@infrastructure/baileys/adapter/BaileysGroupsService';
import { BaileysMessageService } from '@infrastructure/baileys/adapter/BaileysMessageService';
import { BaileysPresenceService } from '@infrastructure/baileys/adapter/BaileysPresenceService';
import { BaileysPrivacyService } from '@infrastructure/baileys/adapter/BaileysPrivacyService';
import { BaileysProfileService } from '@infrastructure/baileys/adapter/BaileysProfileService';
import { IChatStateService } from '@infrastructure/baileys/adapter/IChatStateService';
import { IGroupService } from '@infrastructure/baileys/adapter/IGroupService';
import { IMessageService } from '@infrastructure/baileys/adapter/IMessageService';
import { IPresenceService } from '@infrastructure/baileys/adapter/IPresenceService';
import { IPrivacyService } from '@infrastructure/baileys/adapter/IPrivacyService';
import { IProfileService } from '@infrastructure/baileys/adapter/IProfileService';

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
    private readonly instance: WhatsAppInstanceAggregate,
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly eventHandlers: IBaileysEventHandlers,
    private readonly connectionStore: IConnectionStateStore,
    private readonly eventBus: IConnectionEventBus
  ) {}

  async start(phoneNumber?: string): Promise<void> {
    // this._connection = new BaileysConnection(this.instance.instanceId, {
    //   onQR: async (qr, qrText) => {
    //     await this.connectionStore.setQR(this.instance.instanceId, qr, qrText);
    //   },
    //   onConnected: async (phone) => {
    //     this.instance.connect(phone);
    //     await this.repository.update(this.instance);
    //     await this.connectionStore.clear(this.instance.instanceId);
    //   },
    //   onDisconnected: async (event) => {
    //     this.instance.disconnect(event.reason);
    //     await this.repository.update(this.instance);
    //     await this.connectionStore.clear(this.instance.instanceId);
    //     this._disconnectHandler?.(event);
    //   },
    //   onPairingCode: async (code) => {
    //     await this.connectionStore.setPairingCode(this.instance.instanceId, code);
    //   },
    // });
    // opcion con eventbuss
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

    const router = new BaileysEventRouter(socket, this.instance, this.eventHandlers);

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
      await this.connectionStore.setQR(data.instanceId, data.qrCode, data.qrText);
    });

    this.eventBus.on('connected', async (data) => {
      if (data.instanceId !== this.instance.instanceId) return;

      this.instance.connect(data.phone);
      await this.repository.update(this.instance);

      await this.connectionStore.clear(data.instanceId);
    });

    this.eventBus.on('disconnected', async (data) => {
      if (data.instanceId !== this.instance.instanceId) return;

      this.instance.disconnect(data.reason);
      await this.repository.update(this.instance);

      this._disconnectHandler?.(data);
    });

    this.eventBus.on('pairingCode', async (data) => {
      if (data.instanceId !== this.instance.instanceId) return;

      await this.connectionStore.setPairingCode(data.instanceId, data.pairingCode);
    });
  }
}
