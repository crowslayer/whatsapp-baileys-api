import { Command } from '@shared/domain/commands/Command';

export class AcceptedInviteGroupCommand extends Command<string | undefined> {
  constructor(
    public readonly instanceId: string,
    public readonly code: string
  ) {
    super();
  }
}
