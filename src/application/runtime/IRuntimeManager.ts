import { IWhatsAppRuntime } from '@application/runtime/IWhatsAppRuntime';

export interface IRuntimeManager {
  start(instanceId: string): Promise<void>;
  stop(instanceId: string): Promise<void>;
  restart(instanceId: string): Promise<void>;
  restoreAll(): Promise<void>;
  get(instanceId: string): IWhatsAppRuntime;
}
