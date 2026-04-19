import {
  IWhatsAppQRCodeReadRepository,
  WhatsAppQRCodeStatus,
} from '@domain/queries/IWhatsAppQRCodeReadRepository';

import { IConnectionStateStore } from '@application/runtime/IConnectionStateStore';

export class QRCodeStatus {
  constructor(
    private readonly repository: IWhatsAppQRCodeReadRepository,
    private readonly connectionStore: IConnectionStateStore
  ) {}

  async execute(id: string): Promise<WhatsAppQRCodeStatus> {
    const instance = await this.repository.findById(id);

    if (!instance) {
      throw new Error('Instance not found');
    }
    const connectionState = await this.connectionStore.get(id);

    const qrCode = connectionState?.qr?.base64 ?? null;
    const qrText = connectionState?.qr?.text ?? null;

    let qrStatus: 'pending' | 'ready' | 'expired' = 'pending';

    if (qrCode) {
      qrStatus = 'ready';
    } else if (connectionState) {
      qrStatus = 'expired';
    }
    return {
      status: connectionState?.status ?? instance.status,
      qrCode,
      qrText,
      phoneNumber: instance.phoneNumber,
      qrStatus,
      connected: instance.status === 'connected',
    };
  }
}
