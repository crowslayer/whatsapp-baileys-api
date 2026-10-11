import { IMessageReference } from '@domain/messages/MessageTypes';

import { Command } from '@shared/domain/commands/Command';

export class SendReactionCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly message: IMessageReference,
    public readonly emoji: string
  ) {
    super();
  }
}
