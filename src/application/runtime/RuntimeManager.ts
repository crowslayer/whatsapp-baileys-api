import { setTimeout as delay } from 'node:timers/promises';

import { WhatsAppInstanceAggregate } from '@domain/aggregates/WhatsAppInstanceAggregate';
import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { IRuntimeManager } from '@application/runtime/IRuntimeManager';
import { IRuntimeRegistry } from '@application/runtime/IRuntimeRegistry';
import { IWhatsAppRuntime } from '@application/runtime/IWhatsAppRuntime';
import { WhatsAppInstanceRuntime } from '@application/runtime/WhatsAppInstanceRuntime';
import { WhatsAppRuntimeFactory } from '@application/runtime/WhatsAppRuntimeFactory';

import { ILogger } from '@infrastructure/loggers/Logger';

export class RuntimeManager implements IRuntimeManager {
  private _restarting = new Set<string>();

  constructor(
    private readonly registry: IRuntimeRegistry,
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly runtimeFactory: WhatsAppRuntimeFactory,
    private readonly logger: ILogger
  ) {}

  // ===============================
  // START INSTANCE
  // ===============================
  async start(instanceId: string, phoneNumber?: string): Promise<void> {
    if (this.registryExists(instanceId)) return;

    const instance = await this.getInstanceOrThrow(instanceId);

    const runtime = this.runtimeFactory.create(instance);

    await runtime.start(phoneNumber);

    this.logger.info({
      instance: instanceId,
      event: 'instance.initialize',
    });

    this.registry.register(instanceId, runtime);

    this.attachLifecycle(instanceId, runtime);
  }

  // ===============================
  // STOP INSTANCE
  // ===============================
  async stop(instanceId: string): Promise<void> {
    const runtime = this.safeGet(instanceId);
    if (!runtime) return;

    await runtime.stop();
    this.registry.remove(instanceId);
    this.logger.info({
      instance: instanceId,
      event: 'instance.stop',
    });
  }

  // ===============================
  // RESTART INSTANCE
  // ===============================
  async restart(instanceId: string): Promise<void> {
    if (this._restarting.has(instanceId)) return;

    this._restarting.add(instanceId);

    try {
      await this.stop(instanceId);
      await delay(2000);
      await this.start(instanceId);
      this.logger.info({
        instance: instanceId,
        event: 'instance.restart',
      });
    } finally {
      this._restarting.delete(instanceId);
    }
  }

  // ===============================
  // RESTORE ALL (BOOT)
  // ===============================
  async restoreAll(): Promise<void> {
    const instances = await this.repository.findAll();

    const connected = instances.filter((i) => i.status.isConnected());
    this.logger.info('Instances restoring...');
    await Promise.allSettled(connected.map((i) => this.start(i.instanceId)));
  }

  // ===============================
  // GET RUNTIME
  // ===============================
  get(instanceId: string): IWhatsAppRuntime {
    return this.registry.get(instanceId);
  }

  // ===============================
  // INTERNALS
  // ===============================
  private attachLifecycle(instanceId: string, runtime: WhatsAppInstanceRuntime): void {
    runtime.onDisconnect(async (event) => {
      switch (event.type) {
        case 'TRANSIENT':
          await this.handleReconnect(instanceId);
          break;

        case 'INVALID_SESSION':
        case 'LOGGED_OUT':
          await this.stop(instanceId);
          break;
      }
    });
  }

  private async handleReconnect(instanceId: string): Promise<void> {
    let attempts = 0;
    const max = 5;

    while (attempts < max) {
      attempts++;

      const ms = Math.min(2000 * attempts, 15000);

      await delay(ms);

      try {
        await this.restart(instanceId);
        return;
      } catch {
        // retry
      }
    }

    // fallo definitivo
    await this.stop(instanceId);
  }

  private async getInstanceOrThrow(instanceId: string): Promise<WhatsAppInstanceAggregate> {
    const instance = await this.repository.findById(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }
    return instance;
  }

  private registryExists(instanceId: string): boolean {
    try {
      this.registry.get(instanceId);
      return true;
    } catch {
      return false;
    }
  }

  private safeGet(instanceId: string): IWhatsAppRuntime | undefined {
    try {
      return this.registry.get(instanceId);
    } catch {
      return undefined;
    }
  }
}
