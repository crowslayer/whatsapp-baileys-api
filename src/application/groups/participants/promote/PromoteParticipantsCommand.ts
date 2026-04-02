import { Command } from '@shared/domain/commands/Command';

export class PromoteParticipantsCommand extends Command<void> {
  constructor(
    readonly instanceId: string,
    readonly groupId: string,
    readonly participants: string[]
  ) {
    super();
  }
}
