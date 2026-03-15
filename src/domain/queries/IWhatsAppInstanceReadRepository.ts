export interface IWhatsAppInstanceReadProjection {
  instanceId: string;
  name: string;
  status: string;
  phoneNumber?: string;
  webhookUrl?: string;
  lastConnectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type WhatsAppInstance = IWhatsAppInstanceReadProjection;

export interface IWhatsAppInstanceReadRepository {
  findById(instanceId: string): Promise<IWhatsAppInstanceReadProjection | null>;
  findByName(name: string): Promise<IWhatsAppInstanceReadProjection | null>;
  findAll(): Promise<IWhatsAppInstanceReadProjection[]>;
  exists(instanceId: string): Promise<boolean>;
}
