import { IFlow } from '@application/bot/types/FlowTypes';

export type Flow = IFlow;

export interface IFlowReadRepository {
  findActiveByInstance(instanceId: string): Promise<Flow[]>;
  findByInstance(instanceId: string): Promise<Flow[]>;
  findById(flowId: string): Promise<Flow | null>;
}
