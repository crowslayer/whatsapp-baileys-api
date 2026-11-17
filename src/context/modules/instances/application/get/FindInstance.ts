import {
  IInstanceReadRepository,
  InstanceReadModel,
} from '@modules/instances/domain/IInstanceReadRepository';

export class FindInstance {
  constructor(private readonly repository: IInstanceReadRepository) {}

  async execute(instanceId: string): Promise<InstanceReadModel | null> {
    const instance = await this.repository.findById(instanceId);

    return instance ?? null;
  }
}
