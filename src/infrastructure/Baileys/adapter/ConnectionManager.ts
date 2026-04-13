import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { WhatsAppInstanceRuntime } from '@application/runtime/WhatsAppInstanceRuntime';

export class ConnectionManager {
  private _runtimes = new Map<string, WhatsAppInstanceRuntime>();

  constructor(private readonly repository: IWhatsAppInstanceRepository) {}

  async create(instanceId: string): Promise<void> {
    const instance = await this.repository.findById(instanceId);
    if (!instance) throw new Error('Instance not found');

    const runtime = new WhatsAppInstanceRuntime(instance, this.repository);

    await runtime.start();

    this._runtimes.set(instanceId, runtime);
  }

  get(instanceId: string): WhatsAppInstanceRuntime {
    const runtime = this._runtimes.get(instanceId);
    if (!runtime) throw new Error('Instance not running');
    return runtime;
  }

  async remove(instanceId: string): Promise<void> {
    const runtime = this._runtimes.get(instanceId);
    if (!runtime) return;

    await runtime.stop();
    this._runtimes.delete(instanceId);
  }
}
