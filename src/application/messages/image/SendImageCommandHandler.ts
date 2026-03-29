import { ImageSender } from '@application/messages/image/ImageSender';
import { SendImageCommand } from '@application/messages/image/SendImageCommand';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class SendImageCommandHandler implements ICommandHandler<SendImageCommand> {
  constructor(private readonly sender: ImageSender) {}

  subscribedTo(): typeof SendImageCommand {
    return SendImageCommand;
  }

  async handle(command: SendImageCommand): Promise<void> {
    await this.sender.execute(command);
  }
}
