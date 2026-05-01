import { IFlow } from './FlowTypes';
import { FlowStore } from '../../infrastructure/persistence/Mongo/Repositories/FlowStore';
import { MongoFlowRepository } from '../../infrastructure/persistence/Mongo/Repositories/MongoFlowRepository';
import { FlowModel } from '../../infrastructure/persistence/Mongo/Models/FlowModel';

export class FlowAdminService {
  private store: FlowStore;
  constructor(private readonly repository: MongoFlowRepository, private readonly flowStore?: FlowStore) {
    this.store = this.flowStore ?? new FlowStore(this.repository);
  }

  async createFlow(flow: IFlow): Promise<void> {
    // Persist to Mongo and refresh in-memory store
    await this.repository.saveFlow(flow);
  }

  async getFlow(flowId: string): Promise<IFlow | null> {
    return await this.repository.findById(flowId);
  }

  async updateFlow(flowId: string, patch: Partial<IFlow>): Promise<void> {
    const existing = await this.repository.findById(flowId);
    if (!existing) throw new Error('Flow not found');
    const updated = { ...existing, ...patch } as IFlow;
    await this.repository.saveFlow(updated);
  }

  async deleteFlow(flowId: string): Promise<void> {
    await this.repository.deleteFlow(flowId);
  }

  async listFlows(instanceId: string): Promise<IFlow[]> {
    return await this.repository.findActiveByInstance(instanceId);
  }
}
