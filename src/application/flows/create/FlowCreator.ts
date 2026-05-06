import { FlowAggregate } from '@domain/aggregates/FlowAggregate';
import { IFlowRepository } from '@domain/repositories/IFlowRepository';
import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';

export class FlowCreator {
  constructor(private readonly repository: IFlowRepository) {}

  async execute(instanceId: InstanceId, name: Name): Promise<void> {
    const flow = FlowAggregate.create(instanceId, name);

    await this.repository.save(flow);
  }
}
