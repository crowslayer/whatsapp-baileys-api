import { ICommandHandler } from '@shared/domain/command/CommandHandler';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

import { ImageSender } from '@modules/messages/application/image/ImageSender';
import { SendImageCommand } from '@modules/messages/application/image/SendImageCommand';
import { MessageError } from '@modules/messages/application/MessageError';

export class SendImageCommandHandler implements ICommandHandler<SendImageCommand> {
  constructor(private readonly useCase: ImageSender) {}

  subscribedTo(): typeof SendImageCommand {
    return SendImageCommand;
  }

  async handle(command: SendImageCommand): Promise<ISentMessage> {
    const result = await this.useCase.execute(command);

    if (!result) {
      throw new MessageError('Image message not sender');
    }

    return result;
  }
}
