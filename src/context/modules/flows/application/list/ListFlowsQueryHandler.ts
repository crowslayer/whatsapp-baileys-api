import { IQueryHandler } from '@shared/domain/query/QueryHandler';

import { FlowsResponse } from '@modules/flows/application/FlowsResponse';
import { ListFlows } from '@modules/flows/application/list/ListFlows';
import { ListFlowsQuery } from '@modules/flows/application/list/ListFlowsQuery';

export class ListFlowsQueryHandler implements IQueryHandler<ListFlowsQuery, FlowsResponse> {
  constructor(private readonly useCase: ListFlows) {}

  subscribedTo(): typeof ListFlowsQuery {
    return ListFlowsQuery;
  }

  async handle(query: ListFlowsQuery): Promise<FlowsResponse> {
    const items = await this.useCase.execute(query.instanceId);

    return FlowsResponse.create(items);
  }
}
