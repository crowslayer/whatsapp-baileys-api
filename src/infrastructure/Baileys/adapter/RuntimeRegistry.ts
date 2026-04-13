import { WhatsAppInstanceRuntime } from '@infrastructure/baileys/adapter/WhatsAppInstanceRuntime';

export class RuntimeRegistry {
  private _runtimes = new Map<string, WhatsAppInstanceRuntime>();

  register(instanceId: string, runtime: WhatsAppInstanceRuntime): void {
    this._runtimes.set(instanceId, runtime);
  }

  get(instanceId: string): WhatsAppInstanceRuntime {
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
