import { Command } from '@shared/domain/command/Command';

export class RevokeLinkCommand extends Command<string> {
  constructor(
    readonly instanceId: string,
    readonly groupId: string
  ) {
    super();
  }
}
