import { Flow, IFlowReadRepository } from '@modules/flows/domain/IFlowReadRepository';

export class GetFlow {
  constructor(private readonly repository: IFlowReadRepository) {}

  async execute(flowId: string): Promise<Flow | null> {
    return await this.repository.findById(flowId);
  }
}
