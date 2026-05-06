import { IFlowRepository } from '@domain/repositories/IFlowRepository';
import { FlowId } from '@domain/value-objects/FlowId';

import { Nodes, Trigger } from '@application/bot/types/FlowTypes';

export class NodesCreator {
  constructor(private readonly repository: IFlowRepository) {}

  async execute(flowid: FlowId, nodes: Nodes, start: string, triggers: Trigger[]): Promise<void> {
    try {
      const aggregate = await this.repository.findById(flowid);
      aggregate.updateNodes(nodes, start);
      aggregate.addTriggers(triggers);

      await this.repository.save(aggregate);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('Error creating nodes', error);
      }
      throw error;
    }
  }
}
