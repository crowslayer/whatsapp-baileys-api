import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';

import { Command } from '@shared/domain/commands/Command';

export class CreateFlowCommand extends Command<void> {
  constructor(
    readonly instanceId: InstanceId,
    readonly name: Name
  ) {
    super();
  }
}
