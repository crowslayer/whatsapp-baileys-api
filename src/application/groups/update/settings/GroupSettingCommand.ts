import { Command } from '@shared/domain/commands/Command';

export class GroupSettingCommand extends Command<void> {
  constructor(
    readonly instanceId: string,
    readonly groupId: string,
    readonly announcement?: boolean,
    readonly locked?: boolean
  ) {
    super();
  }
}
