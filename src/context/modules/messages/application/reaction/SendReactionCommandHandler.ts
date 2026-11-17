import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { ReactionSender } from '@modules/messages/application/reaction/ReactionSender';
import { SendReactionCommand } from '@modules/messages/application/reaction/SendReactionCommand';

export class SendReactionCommandHandler implements ICommandHandler<SendReactionCommand> {
  constructor(private readonly useCase: ReactionSender) {}

  subscribedTo(): typeof SendReactionCommand {
    return SendReactionCommand;
  }

  async handle(command: SendReactionCommand): Promise<void> {
    await this.useCase.execute(command);
  }
}
