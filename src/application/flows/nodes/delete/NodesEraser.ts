import { IFlowRepository } from '@domain/repositories/IFlowRepository';
import { FlowId } from '@domain/value-objects/FlowId';

export class NodesEraser {
  constructor(private readonly repository: IFlowRepository) {}

  async execute(flowId: FlowId): Promise<void> {
    const aggregate = await this.repository.findById(flowId);

    aggregate.resetNodes();

    await this.repository.save(aggregate);
  }
}
