import { beforeEach, describe, expect, it, vi } from 'vitest';

const nodeCacheMock = vi.hoisted(() => {
  const store = new Map<string, unknown>();

  const get = vi.fn((key: string) => store.get(key));
  const set = vi.fn((key: string, value: unknown, _ttl?: number) => {
    store.set(key, value);
  });
  const del = vi.fn((key: string) => {
    store.delete(key);
  });
  const construct = vi.fn();

  class NodeCache {
    static readonly store = store;

    constructor(public readonly options: Record<string, unknown> = {}) {
      construct(options);
    }

    get<T>(key: string): T | undefined {
      return get(key) as T | undefined;
    }

    set<T>(key: string, value: T, ttl?: number): void {
      set(key, value, ttl);
    }

    del(key: string): void {
      del(key);
    }
  }

  return { NodeCache, store, get, set, del, construct };
});

vi.mock('@cacheable/node-cache', () => ({
  NodeCache: nodeCacheMock.NodeCache,
  default: nodeCacheMock.NodeCache,
}));

import { NodeCacheConnectionStateStore } from '@shared/infrastructure/cache/NodeCacheConnectionStateStore';

import type { ConnectionState } from '@modules/instances/application/runtime/IConnectionStateStore';

describe('NodeCacheConnectionStateStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nodeCacheMock.store.clear();
  });

  it('creates the underlying cache with the default ttl', () => {
    new NodeCacheConnectionStateStore();

    expect(nodeCacheMock.construct).toHaveBeenCalledWith({
      stdTTL: 120,
      checkperiod: 24,
      useClones: false,
    });
  });

  it('creates the underlying cache with a custom ttl', () => {
    new NodeCacheConnectionStateStore(60);

    expect(nodeCacheMock.construct).toHaveBeenCalledWith({
      stdTTL: 60,
      checkperiod: 12,
      useClones: false,
    });
  });

  it('never lets the check period drop below ten seconds', () => {
    new NodeCacheConnectionStateStore(1);

    expect(nodeCacheMock.construct).toHaveBeenCalledWith({
      stdTTL: 1,
      checkperiod: 10,
      useClones: false,
    });
  });

  it('returns null when there is no cached state', async () => {
    const store = new NodeCacheConnectionStateStore();

    const result = await store.get('instance-1');

    expect(result).toBeNull();
    expect(nodeCacheMock.get).toHaveBeenCalledWith('wa:conn:instance-1');
  });

  it('returns the cached state when it exists', async () => {
    const store = new NodeCacheConnectionStateStore();
    const state: ConnectionState = { status: 'connected' };

    nodeCacheMock.store.set('wa:conn:instance-1', state);

    const result = await store.get('instance-1');

    expect(result).toEqual({ status: 'connected' });
  });

  it('stores the qr payload and sets the qr status', async () => {
    const store = new NodeCacheConnectionStateStore();

    await store.setQR('instance-1', 'base64-qr', 'qr-text');

    expect(nodeCacheMock.set).toHaveBeenCalledWith(
      'wa:conn:instance-1',
      { qr: { base64: 'base64-qr', text: 'qr-text' }, status: 'qr' },
      60
    );
  });

  it('preserves the previous state when setting the qr payload', async () => {
    const store = new NodeCacheConnectionStateStore();

    nodeCacheMock.store.set('wa:conn:instance-1', {
      status: 'connected',
      pairingCode: '123456',
    });

    await store.setQR('instance-1', 'base64-qr', 'qr-text');

    expect(nodeCacheMock.set).toHaveBeenCalledWith(
      'wa:conn:instance-1',
      {
        status: 'qr',
        pairingCode: '123456',
        qr: { base64: 'base64-qr', text: 'qr-text' },
      },
      60
    );
  });

  it('stores the pairing code and sets the qr status', async () => {
    const store = new NodeCacheConnectionStateStore();

    await store.setPairingCode('instance-1', '123456');

    expect(nodeCacheMock.set).toHaveBeenCalledWith(
      'wa:conn:instance-1',
      { pairingCode: '123456', status: 'qr' },
      60
    );
  });

  it('stores the status keeping the rest of the state', async () => {
    const store = new NodeCacheConnectionStateStore();

    nodeCacheMock.store.set('wa:conn:instance-1', {
      status: 'qr',
      qr: { base64: 'b', text: 't' },
    });

    await store.setStatus('instance-1', 'connected');

    expect(nodeCacheMock.set).toHaveBeenCalledWith(
      'wa:conn:instance-1',
      { status: 'connected', qr: { base64: 'b', text: 't' } },
      60
    );
  });

  it('removes the cached state on clear', async () => {
    const store = new NodeCacheConnectionStateStore();

    nodeCacheMock.store.set('wa:conn:instance-1', { status: 'connected' });

    await store.clear('instance-1');

    expect(nodeCacheMock.del).toHaveBeenCalledWith('wa:conn:instance-1');
    expect(await store.get('instance-1')).toBeNull();
  });

  it('isolates the state of each instance', async () => {
    const store = new NodeCacheConnectionStateStore();

    await store.setStatus('instance-1', 'connected');

    expect(await store.get('instance-2')).toBeNull();
  });
});
