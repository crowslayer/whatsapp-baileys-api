import { FlowId } from '@modules/flows/domain/FlowId';
import { IFlowRepository } from '@modules/flows/domain/IFlowRepository';

export class FlowEraser {
  constructor(private readonly repository: IFlowRepository) {}

  async execute(flowId: string): Promise<void> {
    const aggregate = await this.repository.findById(FlowId.fromString(flowId));
    aggregate.deactivate();

    await this.repository.save(aggregate);
  }
}
