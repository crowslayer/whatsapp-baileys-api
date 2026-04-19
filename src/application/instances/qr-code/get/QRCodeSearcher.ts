import {
  IWhatsAppQRCodeReadRepository,
  WhatsAppInstanceQRCode,
} from '@domain/queries/IWhatsAppQRCodeReadRepository';

import { IConnectionStateStore } from '@application/runtime/IConnectionStateStore';

export class QRCodeSearcher {
  constructor(
    private readonly repository: IWhatsAppQRCodeReadRepository,
    private readonly connectionStore: IConnectionStateStore
  ) {}

  async execute(id: string): Promise<WhatsAppInstanceQRCode> {
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
      instanceId: instance.instanceId,
      name: instance.name,
      status: connectionState?.status ?? instance.status,
      qrCode,
      qrText,
      phoneNumber: instance.phoneNumber,
      qrStatus,
    };
  }
}
