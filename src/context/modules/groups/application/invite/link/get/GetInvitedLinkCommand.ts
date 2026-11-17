import { Command } from '@shared/domain/command/Command';

export class GetInvitedLinkCommand extends Command<string> {
  constructor(
    readonly instanceId: string,
    readonly groupId: string
  ) {
    super();
  }
}
