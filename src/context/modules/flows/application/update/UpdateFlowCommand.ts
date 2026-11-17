import { Command } from '@shared/domain/command/Command';

export class UpdateFlowCommand extends Command<void> {
  constructor(
    readonly flowId: string,
    readonly instanceId: string,
    readonly name: string
  ) {
    super();
  }
}
