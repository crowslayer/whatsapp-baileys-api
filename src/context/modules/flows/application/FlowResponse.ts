import { IResponse } from '@shared/domain/Response';

import { Flow } from '@modules/flows/domain/IFlowReadRepository';

export class FlowResponse implements IResponse {
  private constructor(readonly content: Flow | null) {}

  static create(flow: Flow | null): FlowResponse {
    return new FlowResponse(flow);
  }
}
