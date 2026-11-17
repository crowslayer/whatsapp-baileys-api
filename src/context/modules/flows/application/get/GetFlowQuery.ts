import { Query } from '@shared/domain/query/Query';

import { FlowResponse } from '@modules/flows/application/FlowResponse';

export class GetFlowQuery extends Query<FlowResponse> {
  constructor(readonly flowId: string) {
    super();
  }
}
