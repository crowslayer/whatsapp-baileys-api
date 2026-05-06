import { IConversationState } from '@application/bot/types/IConversationState';

export interface IConversationStore<T = IConversationState> {
  get(instanceId: string, userId: string): Promise<T | null>;
  set(instanceId: string, userId: string, data: T, ttlSeconds?: number): Promise<void>;
  update(
    instanceId: string,
    userId: string,
    updater: (current: T | null) => T,
    ttlSeconds?: number
  ): Promise<void>;
  clear(instanceId: string, userId: string): Promise<void>;
}
