import { FlowId } from '@domain/value-objects/FlowId';

import { Command } from '@shared/domain/commands/Command';

export class DeleteNodesCommand extends Command<void> {
  constructor(readonly flowId: FlowId) {
    super();
  }
}
