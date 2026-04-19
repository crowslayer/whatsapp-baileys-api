export interface IWhatsAppQRCodeReadProjection {
  instanceId: string;
  name: string;
  status: string;
  phoneNumber?: string;
  qrCode: string | null;
  qrText: string | null;
  qrStatus: 'pending' | 'ready' | 'expired';
}

export type WhatsAppInstanceQRCode = IWhatsAppQRCodeReadProjection;

export type WhatsAppQRCodeStatus = {
  status: string;
  qrCode?: string;
  qrText?: string;
  phoneNumber?: string;
  connected: boolean;
};

export interface IWhatsAppQRCodeReadRepository {
  findById(instanceId: string): Promise<IWhatsAppQRCodeReadProjection | null>;
  findByName(name: string): Promise<IWhatsAppQRCodeReadProjection | null>;
}
