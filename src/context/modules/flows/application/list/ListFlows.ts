import { Flow, IFlowReadRepository } from '@modules/flows/domain/IFlowReadRepository';

export class ListFlows {
  constructor(private readonly repository: IFlowReadRepository) {}

  execute(instanceId: string): Promise<Flow[]> {
    return this.repository.findByInstance(instanceId);
  }
}
