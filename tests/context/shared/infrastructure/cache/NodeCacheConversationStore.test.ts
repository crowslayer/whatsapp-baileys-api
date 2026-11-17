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

import { NodeCacheConversationStore } from '@shared/infrastructure/cache/NodeCacheConversationStore';

import type { IConversationState } from '@modules/bot/domain/types/IConversationState';

const buildState = (conversationId: string): IConversationState => ({
  instanceId: 'instance-1',
  conversationId,
  variables: { step: 1 },
});

describe('NodeCacheConversationStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nodeCacheMock.store.clear();
  });

  it('creates the underlying cache with the default options', () => {
    new NodeCacheConversationStore();

    expect(nodeCacheMock.construct).toHaveBeenCalledWith({
      stdTTL: 600,
      checkperiod: 120,
    });
  });

  it('creates the underlying cache with the provided options', () => {
    new NodeCacheConversationStore({ stdTTL: 30, checkperiod: 5 });

    expect(nodeCacheMock.construct).toHaveBeenCalledWith({
      stdTTL: 30,
      checkperiod: 5,
    });
  });

  it('returns null when the conversation is not cached', async () => {
    const store = new NodeCacheConversationStore();

    const result = await store.get('instance-1', 'user-1');

    expect(result).toBeNull();
    expect(nodeCacheMock.get).toHaveBeenCalledWith('conv:instance-1:user-1');
  });

  it('returns the cached data of the conversation', async () => {
    const store = new NodeCacheConversationStore();
    const state = buildState('conversation-1');

    nodeCacheMock.store.set('conv:instance-1:user-1', { data: state, updatedAt: 1 });

    const result = await store.get('instance-1', 'user-1');

    expect(result).toEqual(state);
  });

  it('stores the data wrapped with an updated timestamp', async () => {
    const store = new NodeCacheConversationStore();
    const state = buildState('conversation-1');

    await store.set('instance-1', 'user-1', state);

    expect(nodeCacheMock.set).toHaveBeenCalledWith(
      'conv:instance-1:user-1',
      { data: state, updatedAt: expect.any(Number) },
      600
    );
  });

  it('stores the data with a custom ttl', async () => {
    const store = new NodeCacheConversationStore();

    await store.set('instance-1', 'user-1', buildState('conversation-1'), 42);

    expect(nodeCacheMock.set).toHaveBeenCalledWith(
      'conv:instance-1:user-1',
      expect.any(Object),
      42
    );
  });

  it('updates the conversation passing the current value to the updater', async () => {
    const store = new NodeCacheConversationStore();
    const state = buildState('conversation-1');
    const updater = vi.fn((current: IConversationState | null) => ({
      ...(current ?? buildState('conversation-1')),
      variables: { step: 2 },
    }));

    nodeCacheMock.store.set('conv:instance-1:user-1', { data: state, updatedAt: 1 });

    await store.update('instance-1', 'user-1', updater);

    expect(updater).toHaveBeenCalledWith(state);
    expect(nodeCacheMock.set).toHaveBeenCalledWith(
      'conv:instance-1:user-1',
      { data: { ...state, variables: { step: 2 } }, updatedAt: expect.any(Number) },
      600
    );
  });

  it('updates the conversation passing null when it is not cached', async () => {
    const store = new NodeCacheConversationStore();
    const updater = vi.fn((current: IConversationState | null) => ({
      instanceId: 'instance-1',
      conversationId: current?.conversationId ?? 'new-conversation',
      variables: {},
    }));

    await store.update('instance-1', 'user-1', updater);

    expect(updater).toHaveBeenCalledWith(null);
  });

  it('updates the conversation with a custom ttl', async () => {
    const store = new NodeCacheConversationStore();

    await store.update(
      'instance-1',
      'user-1',
      (current) => current ?? buildState('conversation-1'),
      15
    );

    expect(nodeCacheMock.set).toHaveBeenCalledWith(
      'conv:instance-1:user-1',
      expect.any(Object),
      15
    );
  });

  it('removes the cached conversation on clear', async () => {
    const store = new NodeCacheConversationStore();

    nodeCacheMock.store.set('conv:instance-1:user-1', {
      data: buildState('conversation-1'),
      updatedAt: 1,
    });

    await store.clear('instance-1', 'user-1');

    expect(nodeCacheMock.del).toHaveBeenCalledWith('conv:instance-1:user-1');
    expect(await store.get('instance-1', 'user-1')).toBeNull();
  });

  it('isolates the conversations of each user', async () => {
    const store = new NodeCacheConversationStore();

    await store.set('instance-1', 'user-1', buildState('conversation-1'));

    expect(await store.get('instance-1', 'user-2')).toBeNull();
  });
});
