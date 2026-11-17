import { FlowAggregate } from '@modules/flows/domain/FlowAggregate';
import { IFlowRepository } from '@modules/flows/domain/IFlowRepository';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { Name } from '@modules/instances/domain/Name';

export class FlowCreator {
  constructor(private readonly repository: IFlowRepository) {}

  async execute(instanceId: InstanceId, name: Name): Promise<void> {
    const flow = FlowAggregate.create(instanceId, name);

    await this.repository.save(flow);
  }
}
