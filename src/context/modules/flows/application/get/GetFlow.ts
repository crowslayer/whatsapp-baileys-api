import { Flow, IFlowReadRepository } from '@modules/flows/domain/IFlowReadRepository';

export class GetFlow {
  constructor(private readonly repository: IFlowReadRepository) {}

  execute(flowId: string): Promise<Flow | null> {
    return this.repository.findById(flowId);
  }
}
