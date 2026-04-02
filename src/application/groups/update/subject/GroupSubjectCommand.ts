import { Command } from '@shared/domain/commands/Command';

export class GroupSubjectCommand extends Command<void> {
  constructor(
    readonly instanceId: string,
    readonly groupId: string,
    readonly subject: string
  ) {
    super();
  }
}
