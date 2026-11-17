import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WhatsAppRuntimeFactory } from '@modules/instances/application/runtime/WhatsAppRuntimeFactory';
import { WhatsAppInstanceRuntime } from '@modules/instances/application/runtime/WhatsAppInstanceRuntime';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';
import { Name } from '@modules/instances/domain/Name';
import type { IChatSynchronizer } from '@modules/chats/application/synchronize/IChatSynchronizer';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import type { IConnectionEventBus } from '@modules/instances/domain/IConnectionEventBus';
import type { IConnectionStateStore } from '@modules/instances/application/runtime/IConnectionStateStore';
import type { IEventBus } from '@shared/domain/event/IEventBus';
import type { ILogger } from '@shared/domain/Logger';
import { WebhookService } from '@apps/backend/http/webhooks/WebhookService';

describe('WhatsAppRuntimeFactory', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('creates a runtime for the requested instance', () => {
    // Arrange
    const factory = new WhatsAppRuntimeFactory(
      { update: vi.fn() } as unknown as IInstanceRepository,
      { syncChats: vi.fn() } as unknown as IChatSynchronizer,
      { send: vi.fn() } as unknown as WebhookService,
      { info: vi.fn(), error: vi.fn() } as unknown as ILogger,
      { get: vi.fn() } as unknown as IConnectionStateStore,
      { on: vi.fn() } as unknown as IConnectionEventBus,
      { publish: vi.fn() } as unknown as IEventBus
    );
    const instance = InstanceAggregate.create({ name: Name.create('Primary') });

    // Act
    const runtime = factory.create(instance);

    // Assert
    expect(runtime).toBeInstanceOf(WhatsAppInstanceRuntime);
  });
});
