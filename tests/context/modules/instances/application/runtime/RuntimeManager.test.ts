import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ILogger } from '@shared/domain/Logger';
import { IWhatsAppRuntime } from '@shared/domain/whatsapp/IWhatsAppRuntime';

import { RuntimeManager } from '@modules/instances/application/runtime/RuntimeManager';
import { RuntimeNotFoundError } from '@modules/instances/application/runtime/RuntimeNotFoundError';
import { RuntimeRegistry } from '@modules/instances/application/runtime/RuntimeRegistry';
import { WhatsAppRuntimeFactory } from '@modules/instances/application/runtime/WhatsAppRuntimeFactory';
import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';

vi.mock('node:timers/promises', () => ({
  setTimeout: vi.fn().mockResolvedValue(undefined),
}));

const VALID_UUID = '018f6c2a-1b2c-7def-89ab-0123456789ab';

type DisconnectHandler = (event: {
  type: 'TRANSIENT' | 'INVALID_SESSION' | 'LOGGED_OUT';
  reason?: string;
}) => void;

const createRuntime = (): IWhatsAppRuntime =>
  ({
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    onDisconnect: vi.fn(),
    messaging: {},
    groups: {},
    profile: {},
    presence: {},
    privacy: {},
    chatState: {},
  }) as unknown as IWhatsAppRuntime;

const createInstance = (connected = true): InstanceAggregate =>
  ({
    instanceId: VALID_UUID,
    status: { isConnected: () => connected },
  }) as unknown as InstanceAggregate;

describe('RuntimeManager', () => {
  let registry: RuntimeRegistry;
  let repository: { findById: ReturnType<typeof vi.fn>; findInstances: ReturnType<typeof vi.fn> };
  let runtimeFactory: { create: ReturnType<typeof vi.fn> };
  let logger: ILogger;
  let manager: RuntimeManager;

  beforeEach(() => {
    vi.clearAllMocks();

    registry = new RuntimeRegistry();
    repository = {
      findById: vi.fn(),
      findInstances: vi.fn().mockResolvedValue([]),
    };
    runtimeFactory = {
      create: vi.fn(),
    };
    logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
    };

    manager = new RuntimeManager(
      registry,
      repository as unknown as IInstanceRepository,
      runtimeFactory as unknown as WhatsAppRuntimeFactory,
      logger
    );
  });

  it('starts the runtime and registers it', async () => {
    const runtime = createRuntime();
    repository.findById.mockResolvedValue(createInstance());
    runtimeFactory.create.mockReturnValue(runtime);

    await manager.start(VALID_UUID);

    expect(runtimeFactory.create).toHaveBeenCalledTimes(1);
    expect(vi.mocked(runtime.start)).toHaveBeenCalledWith(undefined);
    expect(registry.get(VALID_UUID)).toBe(runtime);
  });

  it('starts the runtime with the given phone number', async () => {
    const runtime = createRuntime();
    repository.findById.mockResolvedValue(createInstance());
    runtimeFactory.create.mockReturnValue(runtime);

    await manager.start(VALID_UUID, '1234567890');

    expect(vi.mocked(runtime.start)).toHaveBeenCalledWith('1234567890');
  });

  it('does not start twice when the runtime is already registered', async () => {
    registry.register(VALID_UUID, createRuntime());

    await manager.start(VALID_UUID);

    expect(repository.findById).not.toHaveBeenCalled();
    expect(runtimeFactory.create).not.toHaveBeenCalled();
  });

  it('throws RuntimeNotFoundError when the instance does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(manager.start(VALID_UUID)).rejects.toThrow(RuntimeNotFoundError);
  });

  it('does not register the runtime when starting fails', async () => {
    const runtime = createRuntime();
    vi.mocked(runtime.start).mockRejectedValue(new Error('boom'));
    repository.findById.mockResolvedValue(createInstance());
    runtimeFactory.create.mockReturnValue(runtime);

    await expect(manager.start(VALID_UUID)).rejects.toThrow('boom');
    expect(() => registry.get(VALID_UUID)).toThrow(RuntimeNotFoundError);
  });

  it('attaches the disconnect lifecycle handler after starting', async () => {
    const runtime = createRuntime();
    repository.findById.mockResolvedValue(createInstance());
    runtimeFactory.create.mockReturnValue(runtime);

    await manager.start(VALID_UUID);

    expect(vi.mocked(runtime.onDisconnect)).toHaveBeenCalledTimes(1);
  });

  it('stops the runtime and removes it from the registry', async () => {
    const runtime = createRuntime();
    registry.register(VALID_UUID, runtime);

    await manager.stop(VALID_UUID);

    expect(vi.mocked(runtime.stop)).toHaveBeenCalledTimes(1);
    expect(() => registry.get(VALID_UUID)).toThrow(RuntimeNotFoundError);
  });

  it('does nothing when stopping an unknown runtime', async () => {
    await expect(manager.stop('unknown')).resolves.toBeUndefined();
  });

  it('restarts the instance stopping and starting it again', async () => {
    const runtime = createRuntime();
    repository.findById.mockResolvedValue(createInstance());
    runtimeFactory.create.mockReturnValue(runtime);
    registry.register(VALID_UUID, runtime);

    await manager.restart(VALID_UUID);

    expect(vi.mocked(runtime.stop)).toHaveBeenCalledTimes(1);
    expect(runtimeFactory.create).toHaveBeenCalledTimes(1);
  });

  it('releases the restarting flag after a failed restart', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(manager.restart(VALID_UUID)).rejects.toThrow(RuntimeNotFoundError);
    await expect(manager.restart(VALID_UUID)).rejects.toThrow(RuntimeNotFoundError);
  });

  it('restores only the connected instances', async () => {
    const runtime = createRuntime();
    const connectedInstance = createInstance(true);
    repository.findInstances.mockResolvedValue([connectedInstance, createInstance(false)]);
    repository.findById.mockResolvedValue(connectedInstance);
    runtimeFactory.create.mockReturnValue(runtime);

    await manager.restoreAll();

    expect(runtimeFactory.create).toHaveBeenCalledTimes(1);
  });

  it('resolves the restore even when one instance fails to start', async () => {
    repository.findInstances.mockResolvedValue([createInstance(true)]);
    runtimeFactory.create.mockImplementation(() => {
      throw new Error('factory failure');
    });

    await expect(manager.restoreAll()).resolves.toBeUndefined();
  });

  it('returns the runtime from the registry', () => {
    const runtime = createRuntime();
    registry.register(VALID_UUID, runtime);

    expect(manager.get(VALID_UUID)).toBe(runtime);
  });

  it('throws RuntimeNotFoundError when getting an unknown runtime', () => {
    expect(() => manager.get('unknown')).toThrow(RuntimeNotFoundError);
  });

  it('stops the instance when a logged out disconnect event is received', async () => {
    const runtime = createRuntime();
    repository.findById.mockResolvedValue(createInstance());
    runtimeFactory.create.mockReturnValue(runtime);
    await manager.start(VALID_UUID);

    const handler = vi.mocked(runtime.onDisconnect).mock.calls[0][0] as DisconnectHandler;
    handler({ type: 'LOGGED_OUT' });

    await vi.waitFor(() => {
      expect(vi.mocked(runtime.stop)).toHaveBeenCalled();
    });
  });

  it('restarts the instance when a transient disconnect event is received', async () => {
    const runtime = createRuntime();
    repository.findById.mockResolvedValue(createInstance());
    runtimeFactory.create.mockReturnValue(runtime);
    await manager.start(VALID_UUID);

    const handler = vi.mocked(runtime.onDisconnect).mock.calls[0][0] as DisconnectHandler;
    handler({ type: 'TRANSIENT' });

    await vi.waitFor(() => {
      expect(runtimeFactory.create).toHaveBeenCalledTimes(2);
    });
  });
});
