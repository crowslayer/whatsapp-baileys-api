import { IConnectionStateStore } from '@application/runtime/IConnectionStateStore';

export class QRCodePersist {
  constructor(private readonly connectionStore: IConnectionStateStore) {}

  async execute(data: { instanceId: string; qrCode: string; qrText: string }): Promise<void> {
    await this.connectionStore.setQR(data.instanceId, data.qrCode, data.qrText);
  }
}
