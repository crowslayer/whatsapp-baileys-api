import { Flow, IFlowReadRepository } from '@domain/queries/IFlowReadRepository';

export class ListFlows {
  constructor(private readonly repository: IFlowReadRepository) {}

  async execute(instanceId: string): Promise<Flow[]> {
    return await this.repository.findByInstance(instanceId);
  }
}
