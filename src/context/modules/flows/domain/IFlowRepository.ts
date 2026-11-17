import { FlowAggregate } from '@modules/flows/domain/FlowAggregate';
import { FlowId } from '@modules/flows/domain/FlowId';

export interface IFlowRepository {
  findById(flowId: FlowId): Promise<FlowAggregate>;
  save(flow: FlowAggregate): Promise<void>;
  delete(flowId: FlowId): Promise<void>;
}
