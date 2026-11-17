import { IQueryHandler } from '@shared/domain/query/QueryHandler';

import { InstancesResponse } from '@modules/instances/application/InstancesResponse';
import { InstancesSearcher } from '@modules/instances/application/list/InstancesSearcher';
import { ListInstancesQuery } from '@modules/instances/application/list/ListInstancesQuery';

export class ListInstancesQueryHandler implements IQueryHandler<
  ListInstancesQuery,
  InstancesResponse
> {
  constructor(private readonly useCase: InstancesSearcher) {}

  subscribedTo(): typeof ListInstancesQuery {
    return ListInstancesQuery;
  }

  async handle(_query: ListInstancesQuery): Promise<InstancesResponse> {
    const instances = await this.useCase.execute();
    return InstancesResponse.create(instances);
  }
}
