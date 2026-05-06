import { Flow } from '@domain/queries/IFlowReadRepository';

import { IResponse } from '@shared/domain/Response';

export class FlowsResponse implements IResponse {
  content: Flow[];

  private constructor(content: Flow[]) {
    this.content = content;
  }

  static create(flows: Flow[]): FlowsResponse {
    if (Array.isArray(flows) && flows.length > 0) {
      return new FlowsResponse(flows);
    }
    return FlowsResponse.none();
  }

  static none(): FlowsResponse {
    return new FlowsResponse([]);
  }
}
