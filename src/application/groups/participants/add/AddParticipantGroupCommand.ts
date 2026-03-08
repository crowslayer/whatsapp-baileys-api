import { Command } from '@shared/domain/commands/Command';

export class AddParticipantGroupCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly groupId: string,
    public readonly participants: string[]
  ) {
    super();
  }
}
