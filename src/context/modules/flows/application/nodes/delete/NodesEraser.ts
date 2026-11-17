import { FlowId } from '@modules/flows/domain/FlowId';
import { IFlowRepository } from '@modules/flows/domain/IFlowRepository';

export class NodesEraser {
  constructor(private readonly repository: IFlowRepository) {}

  async execute(flowId: string): Promise<void> {
    const aggregate = await this.repository.findById(FlowId.fromString(flowId));

    aggregate.resetNodes();

    await this.repository.save(aggregate);
  }
}
