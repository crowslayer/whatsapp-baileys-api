import { describe, expect, vi } from 'vitest';
import { RuntimeManager } from '../../../src/application/runtime/RuntimeManager';

function makeRuntimeManager({
  registry = { register: vi.fn(), get: vi.fn(), remove: vi.fn() },
  repository = { findById: vi.fn(), findAll: vi.fn() },
  runtimeFactory = { create: vi.fn() },
  logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
  },
} = {}) {
  return new RuntimeManager(registry, repository, runtimeFactory, logger);
}

describe('RuntimeManager', () => {
  test('should start instance', async () => {
    const mockInstance = { instanceId: 'inst-1' };
    const mockRuntime = { start: vi.fn(), onDisconnect: vi.fn() };
    const registry = {
      register: vi.fn(),
      get: vi.fn().mockImplementation(() => {
        throw new Error('not found');
      }),
      remove: vi.fn(),
    };
    const repository = { findById: vi.fn().mockResolvedValue(mockInstance) };
    const runtimeFactory = { create: vi.fn().mockReturnValue(mockRuntime) };
    const manager = makeRuntimeManager({ registry, repository, runtimeFactory });

    await manager.start('inst-1');
    expect(mockRuntime.start).toHaveBeenCalled();
    expect(registry.register).toHaveBeenCalledWith('inst-1', mockRuntime);
  });

  test('should not start twice', async () => {
    const mockRuntime = { start: vi.fn(), onDisconnect: vi.fn() };
    const registry = {
      register: vi.fn(),
      get: vi.fn().mockReturnValue(mockRuntime),
      remove: vi.fn(),
    };
    const repository = { findById: vi.fn() };
    const runtimeFactory = { create: vi.fn() };
    const manager = makeRuntimeManager({ registry, repository, runtimeFactory });

    await manager.start('inst-1');
    expect(runtimeFactory.create).not.toHaveBeenCalled();
  });
});
