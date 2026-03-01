import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { SendMessageCommand } from './SendMessageCommand';
import { TextMessangeSender } from './TextMessageSender';

export class SendMessageCommandHandler implements ICommandHandler<SendMessageCommand> {
  constructor(private readonly sender: TextMessangeSender) {}

  subscribedTo(): typeof SendMessageCommand {
    return SendMessageCommand;
  }

  async handle(command: SendMessageCommand): Promise<void> {
    await this.sender.execute(command);
  }
}
