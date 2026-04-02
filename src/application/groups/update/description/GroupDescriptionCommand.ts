import { Command } from '@shared/domain/commands/Command';

export class GroupDescriptionCommand extends Command<void> {
  constructor(
    readonly instanceId: string,
    readonly groupId: string,
    readonly description: string
  ) {
    super();
  }
}
