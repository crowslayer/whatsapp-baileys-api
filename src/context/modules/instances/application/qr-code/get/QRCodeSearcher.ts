import { IConnectionStateStore } from '@modules/instances/application/runtime/IConnectionStateStore';
import { WhatsAppInstanceQRCode } from '@modules/instances/domain/IWhatsAppQRCodeReadRepository';

export class QRCodeSearcher {
  constructor(private readonly connectionStore: IConnectionStateStore) {}

  async execute(id: string): Promise<WhatsAppInstanceQRCode> {
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
      instanceId: id,
      status: connectionState?.status || 'pending',
      name: '',
      qrCode,
      qrText,
      qrStatus,
    };
  }
}
