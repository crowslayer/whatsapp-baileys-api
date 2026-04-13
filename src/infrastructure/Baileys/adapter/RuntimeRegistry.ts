import { IRuntimeRegistry } from '@infrastructure/baileys/adapter/IRuntimeRegistry';
import { IWhatsAppRuntime } from '@infrastructure/baileys/adapter/IWhatsAppRuntime';

export class RuntimeRegistry implements IRuntimeRegistry {
  private _runtimes = new Map<string, IWhatsAppRuntime>();

  register(instanceId: string, runtime: IWhatsAppRuntime): void {
    this._runtimes.set(instanceId, runtime);
  }

  get(instanceId: string): IWhatsAppRuntime {
    const runtime = this._runtimes.get(instanceId);
    if (!runtime) {
      throw new Error(`Runtime not found for instance ${instanceId}`);
    }
    return runtime;
  }

  remove(instanceId: string): void {
    this._runtimes.delete(instanceId);
  }
}
