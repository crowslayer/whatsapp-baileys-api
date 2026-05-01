import { FlowSessionModel } from '../Models/FlowSessionModel';
import { IFlowSessionStore, IFlowExecutionState } from '../../../application/bot/IFlowSessionStore';

export class MongoFlowSessionRepository implements IFlowSessionStore {
  async getSession(instanceId: string, chatId: string): Promise<IFlowExecutionState | null> {
    const doc = await FlowSessionModel.findOne({ instanceId, chatId }).exec();
    if (!doc) return null;
    return {
      currentFlowId: doc.currentFlowId,
      currentNodeId: doc.currentNodeId,
      variables: doc.variables || {},
    };
  }

  async setSession(instanceId: string, chatId: string, state: IFlowExecutionState): Promise<void> {
    await FlowSessionModel.updateOne(
      { instanceId, chatId },
      {
        currentFlowId: state.currentFlowId,
        currentNodeId: state.currentNodeId,
        variables: state.variables ?? {},
      },
      { upsert: true }
    ).exec();
  }

  async updateSession(
    instanceId: string,
    chatId: string,
    updater: (current: IFlowExecutionState | null) => IFlowExecutionState
  ): Promise<void> {
    const current = await this.getSession(instanceId, chatId);
    const next = updater(current);
    await this.setSession(instanceId, chatId, next);
  }

  async clearSession(instanceId: string, chatId: string): Promise<void> {
    await FlowSessionModel.deleteOne({ instanceId, chatId }).exec();
  }
}
