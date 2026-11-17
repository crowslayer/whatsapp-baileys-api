import { EventId } from '@shared/domain/event/EventId';
import { IEventBus } from '@shared/domain/event/IEventBus';

import { IConnectionStateStore } from '@modules/instances/application/runtime/IConnectionStateStore';
import { QRCodeGeneratedEvent } from '@modules/instances/domain/events/QRCodeGeneratedEvent';
import { IConnectionEventBus } from '@modules/instances/domain/IConnectionEventBus';
import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceId } from '@modules/instances/domain/InstanceId';

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
    private readonly repository: IInstanceRepository,
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
    const event = QRCodeGeneratedEvent.create({
      aggregateId: data.instanceId,
      eventId: EventId.create().value,
      occurredOn: new Date(),
      payload: data,
    });
    this.domainEventBus.publish([event]);
  }

  private async onConnected(data: ConnectedData): Promise<void> {
    if (!data.instanceId) return;

    const instance = await this.repository.findById(InstanceId.fromString(data.instanceId));
    if (!instance) return;

    instance.connect(data.phone);
    await this.repository.update(instance);

    await this.connectionStore.clear(data.instanceId);
  }

  private async onDisconnected(data: DisconnectedData): Promise<void> {
    if (!data.instanceId) return;

    const instance = await this.repository.findById(InstanceId.fromString(data.instanceId));
    if (!instance) return;

    instance.disconnect(data.reason);
    await this.repository.update(instance);
  }

  private async onPairingCode(data: PairingCodeData): Promise<void> {
    if (!data.instanceId) return;

    await this.connectionStore.setPairingCode(data.instanceId, data.pairingCode);
  }
}
