import { FlowId } from '@domain/value-objects/FlowId';

import { Nodes, Trigger } from '@application/bot/types/FlowTypes';

import { Command } from '@shared/domain/commands/Command';

export class CreateNodesCommand extends Command<void> {
  constructor(
    readonly flowId: FlowId,
    readonly nodes: Nodes,
    readonly start: string,
    readonly triggers: Trigger[]
  ) {
    super();
  }
}
