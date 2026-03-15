import { IResponse } from '@shared/domain/Response';

export interface IWhatsAppInstance {
  instanceId: string;
  name: string;
  status: string;
  phoneNumber?: string;
  webhookUrl?: string;
  lastConnectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  qrCode?: string;
  qrText?: string;
  pairingCode?: string;
}

export class AggregateResponse implements IResponse {
  readonly content: IWhatsAppInstance;

  private constructor(instance: IWhatsAppInstance) {
    this.content = instance;
  }

  static create(instance: IWhatsAppInstance): AggregateResponse {
    return new AggregateResponse(instance);
  }
}
