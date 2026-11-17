import { IRuntimeRegistry } from '@shared/domain/whatsapp/IRuntimeRegistry';
import { IWhatsAppRuntime } from '@shared/domain/whatsapp/IWhatsAppRuntime';

import { RuntimeNotFoundError } from '@modules/instances/application/runtime/RuntimeNotFoundError';

export class RuntimeRegistry implements IRuntimeRegistry {
  private _runtimes = new Map<string, IWhatsAppRuntime>();

  register(instanceId: string, runtime: IWhatsAppRuntime): void {
    this._runtimes.set(instanceId, runtime);
  }

  get(instanceId: string): IWhatsAppRuntime {
    const runtime = this._runtimes.get(instanceId);
    if (!runtime) {
      throw new RuntimeNotFoundError(`Runtime not found for instance ${instanceId}`);
    }
    return runtime;
  }

  remove(instanceId: string): void {
    this._runtimes.delete(instanceId);
  }
}
