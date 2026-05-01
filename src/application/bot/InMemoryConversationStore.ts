import { IConversationStore } from './IConversationStore';
import { IConversationState } from './IConversationState';

export class InMemoryConversationStore implements IConversationStore<IConversationState> {
  private _store = new Map<string, IConversationState>();

  private key(instanceId: string, chatId: string): string {
    return `${instanceId}:${chatId}`;
  }

  async get(instanceId: string, userId: string): Promise<IConversationState | null> {
    return this._store.get(this.key(instanceId, userId)) ?? null;
  }

  async set(instanceId: string, userId: string, data: IConversationState, ttlSeconds?: number): Promise<void> {
    this._store.set(this.key(instanceId, userId), data);
  }

  async update(
    instanceId: string,
    userId: string,
    updater: (current: IConversationState | null) => IConversationState,
    ttlSeconds?: number
  ): Promise<void> {
    const k = this.key(instanceId, userId);
    const current = this._store.get(k) ?? null;
    const next = updater(current);
    this._store.set(k, next);
  }

  async clear(instanceId: string, userId: string): Promise<void> {
    this._store.delete(this.key(instanceId, userId));
  }
}
