import { ICommandHandler } from '@shared/domain/command/CommandHandler';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

import { MessageError } from '@modules/messages/application/MessageError';
import { SendVideoCommand } from '@modules/messages/application/video/SendVideoCommand';
import { VideoSender } from '@modules/messages/application/video/VideoSender';

export class SendVideoCommandHandler implements ICommandHandler<SendVideoCommand> {
  constructor(private readonly useCase: VideoSender) {}

  subscribedTo(): typeof SendVideoCommand {
    return SendVideoCommand;
  }

  async handle(command: SendVideoCommand): Promise<ISentMessage> {
    const result = await this.useCase.execute(command);
    if (!result) {
      throw new MessageError('Image message not sender');
    }

    return result;
  }
}
