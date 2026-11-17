import { FlowId } from '@modules/flows/domain/FlowId';
import { IFlowRepository } from '@modules/flows/domain/IFlowRepository';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { Name } from '@modules/instances/domain/Name';

type FlowProps = {
  flowId: string;
  instanceId: string;
  name: string;
};

export class FlowUpdater {
  constructor(private readonly repository: IFlowRepository) {}

  async execute(props: FlowProps): Promise<void> {
    const aggregate = await this.repository.findById(FlowId.fromString(props.flowId));
    aggregate.changeInstance(InstanceId.fromString(props.instanceId));
    aggregate.rename(Name.create(props.name));

    await this.repository.save(aggregate);
  }
}
