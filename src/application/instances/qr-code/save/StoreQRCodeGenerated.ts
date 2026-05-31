import { QRCodeGeneratedEvent } from '@domain/events/QRCodeGeneratedEvent';

import { QRCodePersist } from '@application/instances/qr-code/save/QRCodePersist';

import { IDomainEventSubscriber } from '@shared/domain/IDomainEventSubscriber';

export class StoreQRCodeGenerated implements IDomainEventSubscriber<QRCodeGeneratedEvent> {
  constructor(private readonly persist: QRCodePersist) {}

  subscribedTo(): [typeof QRCodeGeneratedEvent] {
    return [QRCodeGeneratedEvent];
  }

  async on(event: QRCodeGeneratedEvent): Promise<void> {
    const data = event.payload;
    // store efímero
    await this.persist.execute(data);
  }
}
