import { FlowId } from '@domain/value-objects/FlowId';
import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';

import { Command } from '@shared/domain/commands/Command';

export class UpdateFlowCommand extends Command<void> {
  constructor(
    readonly flowId: FlowId,
    readonly instanceId: InstanceId,
    readonly name: Name
  ) {
    super();
  }
}
