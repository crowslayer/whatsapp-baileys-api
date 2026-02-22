import { WhatsAppQRCodeStatus } from '@domain/queries/IWhatsAppQRCodeReadRepository';

import { IResponse } from '@shared/domain/Response';

export class QRCodeStatusResponse implements IResponse {
  readonly content: WhatsAppQRCodeStatus;
  protected constructor(instance: WhatsAppQRCodeStatus) {
    this.content = instance;
  }

  static create(instance: WhatsAppQRCodeStatus): QRCodeStatusResponse {
    return new QRCodeStatusResponse(instance);
  }
}
