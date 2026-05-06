import { FlowsResponse } from '@application/flows/FlowsResponse';
import { ListFlows } from '@application/flows/list/ListFlows';
import { ListFlowsQuery } from '@application/flows/list/ListFlowsQuery';

import { IQueryHandler } from '@shared/domain/query/QueryHandler';

export class ListFlowsQueryHandler implements IQueryHandler<ListFlowsQuery, FlowsResponse> {
  constructor(private readonly finder: ListFlows) {}

  subscribedTo(): typeof ListFlowsQuery {
    return ListFlowsQuery;
  }

  async handle(query: ListFlowsQuery): Promise<FlowsResponse> {
    const items = await this.finder.execute(query.instanceId);

    return FlowsResponse.create(items);
  }
}
