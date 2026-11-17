import { IEventSubscriber } from '@shared/domain/event/IEventSubscriber';

import { QRCodePersist } from '@modules/instances/application/qr-code/save/QRCodePersist';
import { QRCodeGeneratedEvent } from '@modules/instances/domain/events/QRCodeGeneratedEvent';

export class StoreQRCodeGenerated implements IEventSubscriber<QRCodeGeneratedEvent> {
  constructor(private readonly useCase: QRCodePersist) {}

  subscribedTo(): [typeof QRCodeGeneratedEvent] {
    return [QRCodeGeneratedEvent];
  }

  async on(event: QRCodeGeneratedEvent): Promise<void> {
    const data = event.payload;
    // store efímero
    await this.useCase.execute(data);
  }
}
