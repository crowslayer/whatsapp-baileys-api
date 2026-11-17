import { Command } from '@shared/domain/command/Command';

export class CreateFlowCommand extends Command<void> {
  constructor(
    readonly instanceId: string,
    readonly name: string
  ) {
    super();
  }
}
