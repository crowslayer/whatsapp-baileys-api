import { IFlow } from '../../../application/services/bot/FlowTypes';
import { IFlowRepository } from '../../../../domain/repositories/IFlowRepository';

export class FlowStore {
  private _cache = new Map<string, IFlow[]>();

  constructor(private readonly repository: IFlowRepository) {}

  async loadActiveFlowsForInstance(instanceId: string): Promise<IFlow[]> {
    const flows = await this.repository.findActiveByInstance(instanceId);
    this._cache.set(instanceId, flows);
    return flows;
  }

  getActiveFlows(instanceId: string): IFlow[] {
    return this._cache.get(instanceId) ?? [];
  }

  clear(): void {
    this._cache.clear();
  }
}
