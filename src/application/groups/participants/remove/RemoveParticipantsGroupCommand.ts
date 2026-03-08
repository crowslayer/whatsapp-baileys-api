import { Command } from '@shared/domain/commands/Command';

export class RemoveParticipantsGroupCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly groupId: string,
    public readonly participants: string[]
  ) {
    super();
  }
}
