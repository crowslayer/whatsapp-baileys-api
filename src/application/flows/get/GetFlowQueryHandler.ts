import { FlowResponse } from '@application/flows/FlowResponse';
import { GetFlow } from '@application/flows/get/GetFlow';
import { GetFlowQuery } from '@application/flows/get/GetFlowQuery';

import { IQueryHandler } from '@shared/domain/query/QueryHandler';

export class GetFlowQueryHandler implements IQueryHandler<GetFlowQuery, FlowResponse> {
  constructor(private readonly finder: GetFlow) {}

  subscribedTo(): typeof GetFlowQuery {
    return GetFlowQuery;
  }

  async handle(query: GetFlowQuery): Promise<FlowResponse> {
    const item = await this.finder.execute(query.flowId);
    return FlowResponse.create(item);
  }
}
