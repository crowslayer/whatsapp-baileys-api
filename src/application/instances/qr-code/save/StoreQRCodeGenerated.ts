import { QRCodeGeneratedEvent } from '@domain/events/QRCodeGeneratedEvent';

import { IConnectionStateStore } from '@application/runtime/IConnectionStateStore';

import { IDomainEventSubscriber } from '@shared/domain/IDomainEventSubscriber';

export class StoreQRCodeGenerated implements IDomainEventSubscriber<QRCodeGeneratedEvent> {
  constructor(private readonly connectionStore: IConnectionStateStore) {}

  subscribedTo(): [typeof QRCodeGeneratedEvent] {
    return [QRCodeGeneratedEvent];
  }

  async on(event: QRCodeGeneratedEvent): Promise<void> {
    console.log(event);
    const data = event.payload;
    // store efímero
    await this.connectionStore.setQR(data.instanceId, data.qrCode, data.qrText);
  }
}
