import { Command } from '@shared/domain/command/Command';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

export class SendMessageCommand extends Command<ISentMessage | undefined> {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly message: string
  ) {
    super();
  }
}
