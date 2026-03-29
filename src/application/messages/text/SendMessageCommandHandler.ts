import { SendMessageCommand } from '@application/messages/text/SendMessageCommand';
import { TextMessageSender } from '@application/messages/text/TextMessageSender';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class SendMessageCommandHandler implements ICommandHandler<SendMessageCommand> {
  constructor(private readonly sender: TextMessageSender) {}

  subscribedTo(): typeof SendMessageCommand {
    return SendMessageCommand;
  }

  async handle(command: SendMessageCommand): Promise<void> {
    await this.sender.execute(command);
  }
}
