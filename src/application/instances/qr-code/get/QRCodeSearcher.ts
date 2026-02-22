import {
  IWhatsAppQRCodeReadRepository,
  WhatsAppInstanceQRCode,
} from '@domain/queries/IWhatsAppQRCodeReadRepository';

export class QRCodeSearcher {
  constructor(private readonly repository: IWhatsAppQRCodeReadRepository) {}

  async execute(id: string): Promise<WhatsAppInstanceQRCode> {
    const instance = await this.repository.findById(id);

    if (!instance) {
      throw new Error('Instance not found');
    }
    return instance;
  }
}
