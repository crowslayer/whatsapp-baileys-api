import { FlowsResponse } from '@application/flows/FlowsResponse';

import { Query } from '@shared/domain/query/Query';

export class ListFlowsQuery extends Query<FlowsResponse> {
  constructor(readonly instanceId: string) {
    super();
  }
}
