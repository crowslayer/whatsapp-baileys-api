import { Flow, IFlowReadRepository } from '@domain/queries/IFlowReadRepository';

import { IFlow } from '@application/bot/types/FlowTypes';

import { FlowModel, IFlowDocument } from '@infrastructure/persistence/mongo/models/FlowModel';

export class MongoFlowReadRepository implements IFlowReadRepository {
  async findActiveByInstance(instanceId: string): Promise<Flow[]> {
    return await FlowModel.find({ instanceId, isActive: true }).lean<Flow[]>().exec();
  }

  async findByInstance(instanceId: string): Promise<Flow[]> {
    return await FlowModel.find({ instanceId }).sort({ createdAt: -1 }).lean<Flow[]>().exec();
  }

  async findById(flowId: string): Promise<IFlow | null> {
    return await FlowModel.findOne({ flowId }).lean<Flow>().exec();
  }

  private toReadProjection(doc: IFlowDocument): IFlow {
    const nodesObj: Record<string, any> = {};
    for (const [key, value] of doc.nodes.entries()) {
      nodesObj[key] = value.toObject ? value.toObject() : value;
    }
    return {
      flowId: doc.flowId,
      instanceId: doc.instanceId,
      version: doc.version,
      name: doc.name,
      start: doc.start,
      nodes: nodesObj,
      triggers: doc.triggers ?? [],
      isActive: doc.isActive,
    };
  }
}
