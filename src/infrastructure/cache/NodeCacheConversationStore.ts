import NodeCache from '@cacheable/node-cache';

// import { IConversationStore } from '@application/services/bot/IConversationStore';

type StoreValue<T> = {
  data: T;
  updatedAt: number;
};

export class NodeCacheConversationStore<T = any> {
  // implements IConversationStore<T> {
  private _cache: NodeCache<StoreValue<T>>;
  private _defaultTTL: number;

  constructor(options?: { stdTTL?: number; checkperiod?: number }) {
    this._cache = new NodeCache({
      stdTTL: options?.stdTTL ?? 600, // 10 min default
      checkperiod: options?.checkperiod ?? 120,
    });

    this._defaultTTL = options?.stdTTL ?? 600;
  }

  private key(instanceId: string, userId: string): string {
    return `conv:${instanceId}:${userId}`;
  }

  async get(instanceId: string, userId: string): Promise<T | null> {
    const value = this._cache.get(this.key(instanceId, userId));
    return value?.data ?? null;
  }

  async set(instanceId: string, userId: string, data: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this._defaultTTL;

    this._cache.set(
      this.key(instanceId, userId),
      {
        data,
        updatedAt: Date.now(),
      },
      ttl
    );
  }

  async update(
    instanceId: string,
    userId: string,
    updater: (current: T | null) => T,
    ttlSeconds?: number
  ): Promise<void> {
    const current = await this.get(instanceId, userId);
    const updated = updater(current);

    await this.set(instanceId, userId, updated, ttlSeconds);
  }

  async clear(instanceId: string, userId: string): Promise<void> {
    this._cache.del(this.key(instanceId, userId));
  }
}
