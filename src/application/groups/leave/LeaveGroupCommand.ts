import { Command } from '@shared/domain/commands/Command';

export class LeaveGroupCommand extends Command<void> {
  constructor(
    readonly instanceId: string,
    readonly groupId: string
  ) {
    super();
  }
}
