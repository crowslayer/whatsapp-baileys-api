import { FlowAggregate } from '@domain/aggregates/FlowAggregate';
import { FlowId } from '@domain/value-objects/FlowId';

export interface IFlowRepository {
  findById(flowId: FlowId): Promise<FlowAggregate>;
  save(flow: FlowAggregate): Promise<void>;
  delete(flowId: FlowId): Promise<void>;
}
