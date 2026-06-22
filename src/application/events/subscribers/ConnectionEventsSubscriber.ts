import { QRCodeGeneratedEvent } from '@domain/events/QRCodeGeneratedEvent';
import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { IConnectionEventBus } from '@application/events/IConnectionEventBus';
import { IConnectionStateStore } from '@application/runtime/IConnectionStateStore';

import { IEventBus } from '@shared/domain/IEventBus';

type QRData = {
  instanceId: string;
  qrCode: string;
  qrText: string;
};

type ConnectedData = {
  instanceId: string;
  phone: string;
};

type DisconnectedData = {
  instanceId: string;
  type: 'TRANSIENT' | 'INVALID_SESSION' | 'LOGGED_OUT';
  reason?: string;
};

type PairingCodeData = {
  instanceId: string;
  pairingCode: string;
};

export class ConnectionEventsSubscriber {
  constructor(
    private readonly eventBus: IConnectionEventBus,
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionStore: IConnectionStateStore,
    private readonly domainEventBus: IEventBus
  ) {}

  subscribe(): void {
    this.eventBus.on('qr', this.onQr.bind(this));
    this.eventBus.on('connected', this.onConnected.bind(this));
    this.eventBus.on('disconnected', this.onDisconnected.bind(this));
    this.eventBus.on('pairingCode', this.onPairingCode.bind(this));
  }

  private async onQr(data: QRData): Promise<void> {
    if (!data.instanceId) return;
    // store efímero
    const event = QRCodeGeneratedEvent.create(data.instanceId, data);
    this.domainEventBus.publish([event]);
  }

  private async onConnected(data: ConnectedData): Promise<void> {
    if (data.instanceId) return;

    const instance = await this.repository.findById(data.instanceId);
    if (!instance) return;

    instance.connect(data.phone);
    await this.repository.update(instance);

    await this.connectionStore.clear(data.instanceId);
  }

  private async onDisconnected(data: DisconnectedData): Promise<void> {
    if (data.instanceId) return;

    const instance = await this.repository.findById(data.instanceId);
    if (!instance) return;

    instance.disconnect(data.reason);
    await this.repository.update(instance);
  }

  private async onPairingCode(data: PairingCodeData): Promise<void> {
    if (!data.instanceId) return;

    await this.connectionStore.setPairingCode(data.instanceId, data.pairingCode);
  }
}
