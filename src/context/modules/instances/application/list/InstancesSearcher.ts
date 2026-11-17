import {
  IInstanceReadRepository,
  InstanceReadModel,
} from '@modules/instances/domain/IInstanceReadRepository';

export class InstancesSearcher {
  constructor(private readonly repository: IInstanceReadRepository) {}

  async execute(): Promise<InstanceReadModel[]> {
    const instances = await this.repository.findAll();
    return instances ?? [];
  }
}
