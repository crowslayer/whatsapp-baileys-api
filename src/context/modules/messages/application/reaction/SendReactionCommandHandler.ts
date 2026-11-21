import { ICommandHandler } from '@shared/domain/command/CommandHandler';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

import { MessageError } from '@modules/messages/application/MessageError';
import { ReactionSender } from '@modules/messages/application/reaction/ReactionSender';
import { SendReactionCommand } from '@modules/messages/application/reaction/SendReactionCommand';

export class SendReactionCommandHandler implements ICommandHandler<SendReactionCommand> {
  constructor(private readonly useCase: ReactionSender) {}

  subscribedTo(): typeof SendReactionCommand {
    return SendReactionCommand;
  }

  async handle(command: SendReactionCommand): Promise<ISentMessage> {
    const result = await this.useCase.execute(command);
    if (!result) {
      throw new MessageError('Image message not sender');
    }

    return result;
  }
}
