import { Command } from '@shared/domain/command/Command';

export class PromoteParticipantsCommand extends Command<void> {
  constructor(
    readonly instanceId: string,
    readonly groupId: string,
    readonly participants: string[]
  ) {
    super();
  }
}
