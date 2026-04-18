import { NodeCache } from '@cacheable/node-cache';

import { ConnectionState, IConnectionStateStore } from '@application/runtime/IConnectionStateStore';

export class NodeCacheConnectionStateStore implements IConnectionStateStore {
  private readonly _cache: NodeCache<ConnectionState>;

  constructor(ttlSeconds = 120) {
    this._cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: Math.max(ttlSeconds * 0.2, 10),
      useClones: false,
    });
  }

  private key(instanceId: string): string {
    return `wa:conn:${instanceId}`;
  }

  async get(instanceId: string): Promise<ConnectionState | null> {
    return this._cache.get(this.key(instanceId)) || null;
  }

  async setQR(instanceId: string, qrBase64: string, qrText: string): Promise<void> {
    const state = (await this.get(instanceId)) || {};

    const next: ConnectionState = {
      ...state,
      qr: {
        base64: qrBase64,
        text: qrText,
      },
      status: 'qr',
    };

    this._cache.set(this.key(instanceId), next, 60);
  }

  async setPairingCode(instanceId: string, code: string): Promise<void> {
    const state = (await this.get(instanceId)) || {};

    const next: ConnectionState = {
      ...state,
      pairingCode: code,
      status: 'qr',
    };

    this._cache.set(this.key(instanceId), next);
  }

  async setStatus(instanceId: string, status: ConnectionState['status']): Promise<void> {
    const state = (await this.get(instanceId)) || {};

    const next: ConnectionState = {
      ...state,
      status,
    };

    this._cache.set(this.key(instanceId), next, 60);
  }

  async clear(instanceId: string): Promise<void> {
    this._cache.del(this.key(instanceId));
  }
}
