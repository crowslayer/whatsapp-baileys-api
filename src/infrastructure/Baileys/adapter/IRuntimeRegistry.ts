import { IWhatsAppRuntime } from '@infrastructure/baileys/adapter/IWhatsAppRuntime';

export interface IRuntimeRegistry {
  register(instanceId: string, runtime: IWhatsAppRuntime): void;
  get(instanceId: string): IWhatsAppRuntime;
  remove(instanceId: string): void;
}
