import { ReactionSender } from '@application/messages/reaction/ReactionSender';
import { SendReactionCommand } from '@application/messages/reaction/SendReactionCommand';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class SendReactionCommandHandler implements ICommandHandler<SendReactionCommand> {
  constructor(private readonly reactionSender: ReactionSender) {}

  subscribedTo(): typeof SendReactionCommand {
    return SendReactionCommand;
  }

  async handle(command: SendReactionCommand): Promise<void> {
    await this.reactionSender.execute(command);
  }
}
