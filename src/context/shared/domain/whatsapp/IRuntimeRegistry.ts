import { IWhatsAppRuntime } from '@shared/domain/whatsapp/IWhatsAppRuntime';

export interface IRuntimeRegistry {
  register(instanceId: string, runtime: IWhatsAppRuntime): void;
  get(instanceId: string): IWhatsAppRuntime;
  remove(instanceId: string): void;
}
