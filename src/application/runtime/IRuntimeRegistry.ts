import { IWhatsAppRuntime } from '@application/runtime/IWhatsAppRuntime';

export interface IRuntimeRegistry {
  register(instanceId: string, runtime: IWhatsAppRuntime): void;
  get(instanceId: string): IWhatsAppRuntime;
  remove(instanceId: string): void;
}
