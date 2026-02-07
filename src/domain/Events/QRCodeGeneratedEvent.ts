import { DomainEvent } from '@shared/domain/DomainEvent';

export class QRCodeGeneratedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName: string = 'qrcode.generated';

  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      qrCode: string;
    }
  ) {
    this.occurredOn = new Date();
  }
}
