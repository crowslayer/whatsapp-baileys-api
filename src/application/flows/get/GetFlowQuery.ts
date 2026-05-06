import { FlowResponse } from '@application/flows/FlowResponse';

import { Query } from '@shared/domain/query/Query';

export class GetFlowQuery extends Query<FlowResponse> {
  constructor(readonly flowId: string) {
    super();
  }
}
