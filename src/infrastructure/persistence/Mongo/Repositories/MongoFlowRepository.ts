import { FlowModel } from '../Models/FlowModel';
import { IFlowRepository } from '../../../../domain/repositories/IFlowRepository';
import { IFlow } from '../../../../application/services/bot/FlowTypes';

export class MongoFlowRepository implements IFlowRepository {
  async findActiveByInstance(instanceId: string): Promise<IFlow[]> {
    const docs = await FlowModel.find({ instanceId, isActive: true }).exec();
    // Simple mapping; assuming FlowTypes matches schema
    return docs.map((d) => d.toObject() as any as IFlow);
  }

  async findById(flowId: string): Promise<IFlow | null> {
    const doc = await FlowModel.findOne({ flowId }).exec();
    return doc ? (doc.toObject() as any as IFlow) : null;
  }

  async saveFlow(flow: IFlow): Promise<void> {
    await FlowModel.updateOne({ flowId: flow.id }, { ...flow }, { upsert: true }).exec();
  }

  async deleteFlow(flowId: string): Promise<void> {
    await FlowModel.deleteOne({ flowId }).exec();
  }
}
