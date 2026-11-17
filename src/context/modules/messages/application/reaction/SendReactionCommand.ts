import { Command } from '@shared/domain/command/Command';
import { IMessageReference } from '@shared/domain/whatsapp/MessageTypes';

export class SendReactionCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly message: IMessageReference,
    public readonly emoji: string | null
  ) {
    super();
  }
}
