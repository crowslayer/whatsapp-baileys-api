import { InstancesResponse } from '@application/instances/InstancesResponse';
import { InstancesSearcher } from '@application/instances/list/InstancesSearcher';
import { ListInstancesQuery } from '@application/instances/list/ListInstancesQuery';

import { IQueryHandler } from '@shared/domain/query/QueryHandler';

export class ListInstancesQueryHandler implements IQueryHandler<
  ListInstancesQuery,
  InstancesResponse
> {
  constructor(private readonly searcher: InstancesSearcher) {}

  subscribedTo(): typeof ListInstancesQuery {
    return ListInstancesQuery;
  }

  async handle(_query: ListInstancesQuery): Promise<InstancesResponse> {
    const instances = await this.searcher.execute();
    return InstancesResponse.create(instances);
  }
}
