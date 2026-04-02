import { Command } from '@shared/domain/commands/Command';

export class GetInvitedLinkCommand extends Command<string> {
  constructor(
    readonly instanceId: string,
    readonly groupId: string
  ) {
    super();
  }
}
