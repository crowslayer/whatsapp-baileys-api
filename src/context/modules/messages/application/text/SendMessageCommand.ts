import { Command } from '@shared/domain/command/Command';

export class SendMessageCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly message: string
  ) {
    super();
  }
}
