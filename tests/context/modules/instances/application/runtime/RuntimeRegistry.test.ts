import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IWhatsAppRuntime } from '@shared/domain/whatsapp/IWhatsAppRuntime';

import { RuntimeNotFoundError } from '@modules/instances/application/runtime/RuntimeNotFoundError';
import { RuntimeRegistry } from '@modules/instances/application/runtime/RuntimeRegistry';

const createRuntime = (): IWhatsAppRuntime =>
  ({
    start: vi.fn(),
    stop: vi.fn(),
    onDisconnect: vi.fn(),
    messaging: {},
    groups: {},
    profile: {},
    presence: {},
    privacy: {},
    chatState: {},
  }) as unknown as IWhatsAppRuntime;

describe('RuntimeRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers and retrieves a runtime', () => {
    const registry = new RuntimeRegistry();
    const runtime = createRuntime();

    registry.register('instance-1', runtime);

    expect(registry.get('instance-1')).toBe(runtime);
  });

  it('returns the last registered runtime for the same instance id', () => {
    const registry = new RuntimeRegistry();
    const first = createRuntime();
    const second = createRuntime();

    registry.register('instance-1', first);
    registry.register('instance-1', second);

    expect(registry.get('instance-1')).toBe(second);
  });

  it('throws RuntimeNotFoundError when the runtime does not exist', () => {
    const registry = new RuntimeRegistry();

    expect(() => registry.get('missing')).toThrow(RuntimeNotFoundError);
  });

  it('includes the instance id in the not found error message', () => {
    const registry = new RuntimeRegistry();

    expect(() => registry.get('missing')).toThrow('Runtime not found for instance missing');
  });

  it('removes a registered runtime', () => {
    const registry = new RuntimeRegistry();
    registry.register('instance-1', createRuntime());

    registry.remove('instance-1');

    expect(() => registry.get('instance-1')).toThrow(RuntimeNotFoundError);
  });

  it('does not throw when removing an unknown runtime', () => {
    const registry = new RuntimeRegistry();

    expect(() => registry.remove('missing')).not.toThrow();
  });

  it('keeps other runtimes untouched when removing one', () => {
    const registry = new RuntimeRegistry();
    const kept = createRuntime();
    registry.register('instance-1', createRuntime());
    registry.register('instance-2', kept);

    registry.remove('instance-1');

    expect(registry.get('instance-2')).toBe(kept);
  });
});
