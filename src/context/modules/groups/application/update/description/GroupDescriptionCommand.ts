import { Command } from '@shared/domain/command/Command';

export class GroupDescriptionCommand extends Command<void> {
  constructor(
    readonly instanceId: string,
    readonly groupId: string,
    readonly description: string
  ) {
    super();
  }
}
