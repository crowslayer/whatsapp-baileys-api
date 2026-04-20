import { IFlow } from '@application/services/bot/FlowTypes';

export class FlowRegistry {
  private _flows = new Map<string, IFlow>();

  register(flow: IFlow): void {
    this._flows.set(flow.id, flow);
  }

  get(flowId: string): IFlow {
    const flow = this._flows.get(flowId);
    if (!flow) throw new Error('Flow not found');
    return flow;
  }
}
