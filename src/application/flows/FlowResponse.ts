import { Flow } from '@domain/queries/IFlowReadRepository';

import { IResponse } from '@shared/domain/Response';

export class FlowResponse implements IResponse {
  private constructor(readonly content: Flow | null) {}

  static create(flow: Flow | null): FlowResponse {
    return new FlowResponse(flow);
  }
}
