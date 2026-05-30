import { QRCodeGeneratedEvent } from '@domain/events/QRCodeGeneratedEvent';

import { IEventBus } from '@shared/domain/IEventBus';

export class QRCodePersist {
  constructor(private readonly eventBus: IEventBus) {}

  async execute(data: { instanceId: string; qrCode: string; qrText: string }): Promise<void> {
    const event = QRCodeGeneratedEvent.create(data.instanceId, data);

    await this.eventBus.publish([event]);
  }
}
