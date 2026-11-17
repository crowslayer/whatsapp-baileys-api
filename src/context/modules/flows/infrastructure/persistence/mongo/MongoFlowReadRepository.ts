import { IFlow } from '@modules/flows/domain/FlowTypes';
import { Flow, IFlowReadRepository } from '@modules/flows/domain/IFlowReadRepository';
import {
  FlowModel,
  IFlowDocument,
} from '@modules/flows/infrastructure/persistence/mongo/FlowModel';

export class MongoFlowReadRepository implements IFlowReadRepository {
  async findActiveByInstance(instanceId: string): Promise<Flow[]> {
    const flows = await FlowModel.find({ instanceId, isActive: true }).lean<Flow[]>().exec();

    return flows || [];
  }

  async findByInstance(instanceId: string): Promise<Flow[]> {
    const flows = await FlowModel.find({ instanceId })
      .sort({ createdAt: -1 })
      .lean<Flow[]>()
      .exec();

    return flows || [];
  }

  async findById(flowId: string): Promise<IFlow | null> {
    const flow = await FlowModel.findOne({ flowId }).lean<Flow>().exec();

    return flow || null;
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
