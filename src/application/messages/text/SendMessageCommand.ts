import { Command } from '@shared/domain/commands/Command';

export class SendMessageCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly message: string
  ) {
    super();
  }
}
