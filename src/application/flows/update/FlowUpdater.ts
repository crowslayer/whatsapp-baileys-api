import { IFlowRepository } from '@domain/repositories/IFlowRepository';
import { FlowId } from '@domain/value-objects/FlowId';
import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';

export class FlowUpdater {
  constructor(private readonly repository: IFlowRepository) {}

  async execute(flowId: FlowId, instanceId: InstanceId, name: Name): Promise<void> {
    const aggregate = await this.repository.findById(flowId);
    aggregate.changeInstance(instanceId);
    aggregate.rename(name);

    await this.repository.save(aggregate);
  }
}
