import { ListInstancesQuery } from '@application/instances/list/ListInstancesQuery';

import { IQueryHandler } from '@shared/domain/query/QueryHandler';

import { InstancesResponse } from '../InstancesResponse';

import { InstancesSearcher } from './InstancesSearcher';

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
