import { WhatsAppInstanceAggregate } from '@domain/aggregates/WhatsAppInstanceAggregate';
import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { IBaileysEventHandlers } from '@application/events/IBaileysEventHandlers';
import { IWhatsAppRuntime } from '@application/runtime/IWhatsAppRuntime';

import { BaileysConnection } from '@infrastructure/baileys/adapter/BaileysConnection';
import { BaileysEventRouter } from '@infrastructure/baileys/adapter/BaileysEventRouter';
import { BaileysGroupsService } from '@infrastructure/baileys/adapter/BaileysGroupsService';
import { BaileysMessageService } from '@infrastructure/baileys/adapter/BaileysMessageService';
import { BaileysPresenceService } from '@infrastructure/baileys/adapter/BaileysPresenceService';
import { BaileysProfileService } from '@infrastructure/baileys/adapter/BaileysProfileService';
import { IGroupService } from '@infrastructure/baileys/adapter/IGroupService';
import { IMessageService } from '@infrastructure/baileys/adapter/IMessageService';
import { IPresenceService } from '@infrastructure/baileys/adapter/IPresenceService';
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
  private _disconnectHandler?: (event: DisconnectEvent) => void;

  constructor(
    private readonly instance: WhatsAppInstanceAggregate,
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly eventHandlers: IBaileysEventHandlers // 👈 INYECTADO
  ) {}

  async start(phoneNumber?: string): Promise<void> {
    this._connection = new BaileysConnection(this.instance.instanceId, {
      onQR: async (qr, qrText) => {
        this.instance.generateQRCode(qr, qrText);
        await this.repository.update(this.instance);
      },
      onConnected: async (phone) => {
        this.instance.connect(phone);
        await this.repository.update(this.instance);
      },
      onDisconnected: async (event) => {
        this.instance.disconnect(event.reason);
        await this.repository.update(this.instance);
        this._disconnectHandler?.(event);
      },
    });

    await this._connection.connect(phoneNumber);

    const socket = this._connection.getSocket();

    this._messaging = new BaileysMessageService(socket);
    this._groups = new BaileysGroupsService(socket);
    this._presence = new BaileysPresenceService(socket);
    this._profile = new BaileysProfileService(socket);

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
}
