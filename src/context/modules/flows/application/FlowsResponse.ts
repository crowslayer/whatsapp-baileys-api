import { IResponse } from '@shared/domain/Response';

import { Flow } from '@modules/flows/domain/IFlowReadRepository';

export class FlowsResponse implements IResponse {
  private constructor(readonly content: Flow[]) {}

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
