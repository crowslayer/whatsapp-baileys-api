import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { ImageSender } from './ImageSender';
import { SendImageCommand } from './SendImageCommand';

export class SendImageCommandHandler implements ICommandHandler<SendImageCommand> {
  constructor(private readonly sender: ImageSender) {}

  subscribedTo(): typeof SendImageCommand {
    return SendImageCommand;
  }

  async handle(command: SendImageCommand): Promise<void> {
    await this.sender.execute(command);
  }
}
