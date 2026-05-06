import { Flow, IFlowReadRepository } from '@domain/queries/IFlowReadRepository';

export class GetFlow {
  constructor(private readonly repository: IFlowReadRepository) {}

  async execute(flowId: string): Promise<Flow | null> {
    return await this.repository.findById(flowId);
  }
}
