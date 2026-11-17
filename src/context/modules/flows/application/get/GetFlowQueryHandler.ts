import { IQueryHandler } from '@shared/domain/query/QueryHandler';

import { FlowResponse } from '@modules/flows/application/FlowResponse';
import { GetFlow } from '@modules/flows/application/get/GetFlow';
import { GetFlowQuery } from '@modules/flows/application/get/GetFlowQuery';

export class GetFlowQueryHandler implements IQueryHandler<GetFlowQuery, FlowResponse> {
  constructor(private readonly useCase: GetFlow) {}

  subscribedTo(): typeof GetFlowQuery {
    return GetFlowQuery;
  }

  async handle(query: GetFlowQuery): Promise<FlowResponse> {
    const item = await this.useCase.execute(query.flowId);
    return FlowResponse.create(item);
  }
}
