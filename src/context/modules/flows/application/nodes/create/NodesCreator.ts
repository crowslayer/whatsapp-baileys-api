import { FlowId } from '@modules/flows/domain/FlowId';
import { Nodes, Trigger } from '@modules/flows/domain/FlowTypes';
import { IFlowRepository } from '@modules/flows/domain/IFlowRepository';

type CreateProps = {
  flowId: string;
  nodes: Nodes;
  start: string;
  triggers: Trigger[];
};

export class NodesCreator {
  constructor(private readonly repository: IFlowRepository) {}

  async execute(props: CreateProps): Promise<void> {
    try {
      const aggregate = await this.repository.findById(FlowId.fromString(props.flowId));
      aggregate.updateNodes(props.nodes, props.start);
      aggregate.addTriggers(props.triggers);

      await this.repository.save(aggregate);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('Error creating nodes', error);
      }
      throw error;
    }
  }
}
