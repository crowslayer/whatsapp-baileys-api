import { FlowAggregate } from '@domain/aggregates/FlowAggregate';
import { IFlowRepository } from '@domain/repositories/IFlowRepository';
import { FlowId } from '@domain/value-objects/FlowId';
import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';

import { IFlow } from '@application/bot/types/FlowTypes';

import { FlowModel, IFlowDocument } from '@infrastructure/persistence/mongo/models/FlowModel';

import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

export class MongoFlowRepository implements IFlowRepository {
  async findById(flowId: FlowId): Promise<FlowAggregate> {
    const doc = await FlowModel.findOne({ flowId: flowId.value }).exec();
    if (!doc || doc === null) {
      throw new NotFoundError('Flow not found');
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
    return FlowAggregate.restore({
      flowId: FlowId.fromString(doc.flowId),
      instanceId: InstanceId.fromString(doc.instanceId),
      name: Name.create(doc.name),
      version: doc.version,
      start: doc.start,
      nodes: doc.nodes,
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
