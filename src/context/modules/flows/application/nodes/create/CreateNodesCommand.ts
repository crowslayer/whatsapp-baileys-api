import { Command } from '@shared/domain/command/Command';

import { Nodes, Trigger } from '@modules/flows/domain/FlowTypes';

export class CreateNodesCommand extends Command<void> {
  constructor(
    readonly flowId: string,
    readonly nodes: Nodes,
    readonly start: string,
    readonly triggers: Trigger[]
  ) {
    super();
  }
}
