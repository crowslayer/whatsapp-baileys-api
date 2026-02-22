import {
  IWhatsAppQRCodeReadRepository,
  WhatsAppQRCodeStatus,
} from '@domain/queries/IWhatsAppQRCodeReadRepository';

export class QRCodeStatus {
  constructor(private readonly repository: IWhatsAppQRCodeReadRepository) {}

  async execute(id: string): Promise<WhatsAppQRCodeStatus> {
    const instance = await this.repository.findById(id);

    if (!instance) {
      throw new Error('Instance not found');
    }
    return {
      status: instance.status,
      qrCode: instance.qrCode,
      qrText: instance.qrText,
      phoneNumber: instance.phoneNumber,
      connected: instance.status === 'connected',
    };
  }
}
