import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  baileysEventHandlersCtor: vi.fn(),
  runtimeCtor: vi.fn(),
}));

vi.mock('@application/events/BaileysEventHandlers', () => ({
  BaileysEventHandlers: class {
    constructor(...args: unknown[]) {
      mocks.baileysEventHandlersCtor(...args);
    }
  },
}));

vi.mock('@application/runtime/WhatsAppInstanceRuntime', () => ({
  WhatsAppInstanceRuntime: class {
    constructor(...args: unknown[]) {
      mocks.runtimeCtor(...args);
    }
  },
}));

import { WhatsAppInstanceRuntime } from '../../../src/application/runtime/WhatsAppInstanceRuntime';
import { WhatsAppRuntimeFactory } from '../../../src/application/runtime/WhatsAppRuntimeFactory';

describe('WhatsAppRuntimeFactory', () => {
  it('should create a WhatsAppInstanceRuntime with the expected dependencies', () => {
    const repository = {};
    const syncService = {};
    const webhookService = {};
    const logger = {};
    const connectionStore = {};
    const eventBus = {};
    const domainEventBus = {};

    const instance = {
      instanceId: 'instance-1',
    };

    const factory = new WhatsAppRuntimeFactory(
      repository as any,
      syncService as any,
      webhookService as any,
      logger as any,
      connectionStore as any,
      eventBus as any,
      domainEventBus as any
    );

    const runtime = factory.create(instance as any);

    expect(mocks.baileysEventHandlersCtor).toHaveBeenCalledTimes(1);

    expect(mocks.baileysEventHandlersCtor).toHaveBeenCalledWith(
      instance,
      syncService,
      webhookService,
      logger
    );

    expect(mocks.runtimeCtor).toHaveBeenCalledTimes(1);

    expect(mocks.runtimeCtor).toHaveBeenCalledWith(
      instance,
      repository,
      expect.anything(), // eventHandlers
      connectionStore,
      eventBus,
      domainEventBus
    );

    expect(runtime).toBeInstanceOf(WhatsAppInstanceRuntime);
  });
});
