import { Command } from '@shared/domain/command/Command';

export class LeaveGroupCommand extends Command<void> {
  constructor(
    readonly instanceId: string,
    readonly groupId: string
  ) {
    super();
  }
}
