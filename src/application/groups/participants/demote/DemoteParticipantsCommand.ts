import { Command } from '@shared/domain/commands/Command';

export class DemoteParticipantsCommand extends Command<void> {
  constructor(
    readonly instanceId: string,
    readonly groupId: string,
    readonly participants: string[]
  ) {
    super();
  }
}
