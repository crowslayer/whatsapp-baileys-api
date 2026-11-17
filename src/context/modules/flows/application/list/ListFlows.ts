import { Flow, IFlowReadRepository } from '@modules/flows/domain/IFlowReadRepository';

export class ListFlows {
  constructor(private readonly repository: IFlowReadRepository) {}

  async execute(instanceId: string): Promise<Flow[]> {
    return await this.repository.findByInstance(instanceId);
  }
}
