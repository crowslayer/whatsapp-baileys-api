import { Command } from '@shared/domain/command/Command';

export class AddParticipantGroupCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly groupId: string,
    public readonly participants: string[]
  ) {
    super();
  }
}
