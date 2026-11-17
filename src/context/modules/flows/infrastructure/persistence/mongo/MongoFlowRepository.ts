import { FlowAggregate } from '@modules/flows/domain/FlowAggregate';
import { FlowId } from '@modules/flows/domain/FlowId';
import { FlowNotFoundError } from '@modules/flows/domain/FlowNotFoundError';
import { IFlow } from '@modules/flows/domain/FlowTypes';
import { IFlowRepository } from '@modules/flows/domain/IFlowRepository';
import {
  FlowModel,
  IFlowDocument,
} from '@modules/flows/infrastructure/persistence/mongo/FlowModel';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { Name } from '@modules/instances/domain/Name';

export class MongoFlowRepository implements IFlowRepository {
  async findById(flowId: FlowId): Promise<FlowAggregate> {
    const doc = await FlowModel.findOne({ flowId: flowId.value }).exec();
    if (!doc || doc === null) {
      throw new FlowNotFoundError('Flow not found');
    }
    return this.toDomain(doc);
  }

  async save(flow: FlowAggregate): Promise<void> {
    const doc = this.toDcument(flow);
    await FlowModel.updateOne({ flowId: flow.flowId.value }, { ...doc }, { upsert: true }).exec();
  }

  async delete(flowId: FlowId): Promise<void> {
    await FlowModel.deleteOne({ flowId: flowId.value }).exec();
  }

  private toDomain(doc: IFlowDocument): FlowAggregate {
    const nodes = doc.nodes instanceof Map ? Object.fromEntries(doc.nodes) : doc.nodes;
    return FlowAggregate.restore({
      flowId: FlowId.fromString(doc.flowId),
      instanceId: InstanceId.fromString(doc.instanceId),
      name: Name.create(doc.name),
      version: doc.version,
      start: doc.start,
      nodes,
      isActive: doc.isActive,
      triggers: doc.triggers,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDcument(aggregate: FlowAggregate): IFlow {
    return {
      flowId: aggregate.flowId.value,
      instanceId: aggregate.instanceId.value,
      version: aggregate.version,
      name: aggregate.name.value,
      start: aggregate.start,
      nodes: aggregate.nodes,
      triggers: aggregate.triggers,
      isActive: aggregate.isActive,
      createdAt: aggregate.createdAt ?? new Date(),
      updatedAt: aggregate.updatedAt ?? new Date(),
    };
  }
}
