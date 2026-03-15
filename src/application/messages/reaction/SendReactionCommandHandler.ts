import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { ReactionSender } from './ReactionSender';
import { SendReactionCommand } from './SendReactionCommand';

export class SendReactionCommandHandler implements ICommandHandler<SendReactionCommand> {
  constructor(private readonly reactionSender: ReactionSender) {}

  subscribedTo(): typeof SendReactionCommand {
    return SendReactionCommand;
  }

  async handle(command: SendReactionCommand): Promise<void> {
    await this.reactionSender.execute(command);
  }
}
