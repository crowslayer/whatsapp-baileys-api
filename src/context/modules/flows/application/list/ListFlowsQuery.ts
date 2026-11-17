import { Query } from '@shared/domain/query/Query';

import { FlowsResponse } from '@modules/flows/application/FlowsResponse';

export class ListFlowsQuery extends Query<FlowsResponse> {
  constructor(readonly instanceId: string) {
    super();
  }
}
