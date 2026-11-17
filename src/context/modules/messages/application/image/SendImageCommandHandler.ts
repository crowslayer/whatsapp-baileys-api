import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { ImageSender } from '@modules/messages/application/image/ImageSender';
import { SendImageCommand } from '@modules/messages/application/image/SendImageCommand';

export class SendImageCommandHandler implements ICommandHandler<SendImageCommand> {
  constructor(private readonly useCase: ImageSender) {}

  subscribedTo(): typeof SendImageCommand {
    return SendImageCommand;
  }

  async handle(command: SendImageCommand): Promise<void> {
    await this.useCase.execute(command);
  }
}
