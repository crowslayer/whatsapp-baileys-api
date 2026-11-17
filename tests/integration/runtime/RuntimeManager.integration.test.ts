import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ILogger } from '@shared/domain/Logger';
import { IWhatsAppRuntime } from '@shared/domain/whatsapp/IWhatsAppRuntime';
import { RuntimeManager } from '@modules/instances/application/runtime/RuntimeManager';
import { RuntimeNotFoundError } from '@modules/instances/application/runtime/RuntimeNotFoundError';
import { RuntimeRegistry } from '@modules/instances/application/runtime/RuntimeRegistry';
import { WhatsAppRuntimeFactory } from '@modules/instances/application/runtime/WhatsAppRuntimeFactory';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';
import { Name } from '@modules/instances/domain/Name';
import { MongoInstanceRepository } from '@modules/instances/infrastructure/persistence/mongo/MongoInstanceRepository';

import { MongoTestDatabase } from '../support/MongoTestDatabase';

const createRuntime = () => ({
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn().mockResolvedValue(undefined),
  onDisconnect: vi.fn(),
});

const createLogger = (): ILogger =>
  ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
  }) as ILogger;

describe('RuntimeManager integration', () => {
  const database = new MongoTestDatabase();
  const repository = new MongoInstanceRepository();

  beforeAll(async () => {
    await database.connect();
  }, 60_000);

  beforeEach(async () => {
    vi.clearAllMocks();
    await database.clear();
  });

  afterAll(async () => {
    await database.disconnect();
  }, 60_000);

  it('starts and registers a runtime for an instance persisted in MongoDB', async () => {
    // Arrange
    const instance = InstanceAggregate.create({ name: Name.create('Runtime start integration') });
    await repository.save(instance);
    const runtime = createRuntime();
    const registry = new RuntimeRegistry();
    const factory = { create: vi.fn(() => runtime) } as unknown as WhatsAppRuntimeFactory;
    const manager = new RuntimeManager(registry, repository, factory, createLogger());

    // Act
    await manager.start(instance.instanceId, '5512345678');

    // Assert
    expect(factory.create).toHaveBeenCalledTimes(1);
    expect(runtime.start).toHaveBeenCalledWith('5512345678');
    expect(registry.get(instance.instanceId)).toBe(runtime);
    expect(runtime.onDisconnect).toHaveBeenCalledTimes(1);
  });

  it('does not create or start a duplicate runtime for an already registered instance', async () => {
    // Arrange
    const instance = InstanceAggregate.create({
      name: Name.create('Runtime idempotency integration'),
    });
    await repository.save(instance);
    const runtime = createRuntime();
    const registry = new RuntimeRegistry();
    registry.register(instance.instanceId, runtime as unknown as IWhatsAppRuntime);
    const factory = { create: vi.fn(() => createRuntime()) } as unknown as WhatsAppRuntimeFactory;
    const manager = new RuntimeManager(registry, repository, factory, createLogger());

    // Act
    await manager.start(instance.instanceId);

    // Assert
    expect(factory.create).not.toHaveBeenCalled();
    expect(runtime.start).not.toHaveBeenCalled();
  });

  it('stops a runtime and removes it from the registry', async () => {
    // Arrange
    const instance = InstanceAggregate.create({ name: Name.create('Runtime stop integration') });
    const runtime = createRuntime();
    const registry = new RuntimeRegistry();
    registry.register(instance.instanceId, runtime as unknown as IWhatsAppRuntime);
    const factory = { create: vi.fn() } as unknown as WhatsAppRuntimeFactory;
    const manager = new RuntimeManager(registry, repository, factory, createLogger());

    // Act
    await manager.stop(instance.instanceId);

    // Assert
    expect(runtime.stop).toHaveBeenCalledTimes(1);
    expect(() => registry.get(instance.instanceId)).toThrow(RuntimeNotFoundError);
  });

  it('restores only connected instances from MongoDB', async () => {
    // Arrange
    const connected = InstanceAggregate.create({ name: Name.create('Connected runtime restore') });
    connected.connect('5512345678');
    const disconnected = InstanceAggregate.create({
      name: Name.create('Disconnected runtime restore'),
    });
    await Promise.all([repository.save(connected), repository.save(disconnected)]);
    const runtimes = [createRuntime()];
    let created = 0;
    const registry = new RuntimeRegistry();
    const factory = {
      create: vi.fn(() => runtimes[created++]),
    } as unknown as WhatsAppRuntimeFactory;
    const manager = new RuntimeManager(registry, repository, factory, createLogger());

    // Act
    await manager.restoreAll();

    // Assert
    expect(factory.create).toHaveBeenCalledTimes(1);
    expect(registry.get(connected.instanceId)).toBe(runtimes[0]);
    expect(() => registry.get(disconnected.instanceId)).toThrow(RuntimeNotFoundError);
    expect(runtimes[0]?.start).toHaveBeenCalledTimes(1);
  });

  it('throws a domain error when starting an instance missing from MongoDB', async () => {
    // Arrange
    const registry = new RuntimeRegistry();
    const factory = { create: vi.fn() } as unknown as WhatsAppRuntimeFactory;
    const manager = new RuntimeManager(registry, repository, factory, createLogger());

    // Act & Assert
    await expect(manager.start('85f89d6f-f00d-4814-b79a-d617c63b40bc')).rejects.toThrow(
      RuntimeNotFoundError
    );
    expect(factory.create).not.toHaveBeenCalled();
  });
});
