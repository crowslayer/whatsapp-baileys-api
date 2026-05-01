import { MongoFlowSessionRepository } from './MongoFlowSessionRepository';
import { IFlowSessionStore, IFlowExecutionState } from '../../../application/bot/IFlowSessionStore';

export class MongoFlowSessionStore implements IFlowSessionStore {
  constructor(private readonly repo: MongoFlowSessionRepository = new MongoFlowSessionRepository()) {}

  async getSession(instanceId: string, chatId: string): Promise<IFlowExecutionState | null> {
    return this.repo.getSession(instanceId, chatId);
  }

  async setSession(instanceId: string, chatId: string, state: IFlowExecutionState): Promise<void> {
    await this.repo.setSession(instanceId, chatId, state);
  }

  async updateSession(
    instanceId: string,
    chatId: string,
    updater: (current: IFlowExecutionState | null) => IFlowExecutionState
  ): Promise<void> {
    await this.repo.updateSession(instanceId, chatId, updater);
  }

  async clearSession(instanceId: string, chatId: string): Promise<void> {
    await this.repo.clearSession(instanceId, chatId);
  }
}
