import { Command } from '@shared/domain/commands/Command';

export class SendReactionCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly messageId: string,
    public readonly emoji: string,
    public readonly chatId: string
  ) {
    super();
  }
}
