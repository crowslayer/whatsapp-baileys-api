import { IWhatsAppRuntime } from '@shared/domain/whatsapp/IWhatsAppRuntime';

export interface IRuntimeManager {
  start(instanceId: string, phoneNumber?: string): Promise<void>;
  stop(instanceId: string): Promise<void>;
  restart(instanceId: string): Promise<void>;
  restoreAll(): Promise<void>;
  get(instanceId: string): IWhatsAppRuntime;
}
