import { WhatsAppInstanceQRCode } from '@domain/queries/IWhatsAppQRCodeReadRepository';

import { IResponse } from '@shared/domain/Response';

export class QRCodeResponse implements IResponse {
  readonly content: WhatsAppInstanceQRCode;
  protected constructor(instance: WhatsAppInstanceQRCode) {
    this.content = instance;
  }

  static create(instance: WhatsAppInstanceQRCode): QRCodeResponse {
    return new QRCodeResponse(instance);
  }
}
