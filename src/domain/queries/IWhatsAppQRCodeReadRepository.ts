export interface IWhatsAppQRCodeReadProjection {
  instanceId: string;
  name: string;
  status: string;
  phoneNumber?: string;
  qrCode: string;
  qrText: string;
}

export type WhatsAppInstanceQRCode = IWhatsAppQRCodeReadProjection;

export type WhatsAppQRCodeStatus = {
  status: string;
  qrCode: string;
  qrText: string;
  phoneNumber?: string;
  connected: boolean;
};

export interface IWhatsAppQRCodeReadRepository {
  findById(instanceId: string): Promise<IWhatsAppQRCodeReadProjection | null>;
  findByName(name: string): Promise<IWhatsAppQRCodeReadProjection | null>;
}
