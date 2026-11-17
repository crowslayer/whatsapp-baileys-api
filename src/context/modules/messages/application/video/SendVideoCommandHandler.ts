import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { SendVideoCommand } from '@modules/messages/application/video/SendVideoCommand';
import { VideoSender } from '@modules/messages/application/video/VideoSender';

export class SendVideoCommandHandler implements ICommandHandler<SendVideoCommand> {
  constructor(private readonly useCase: VideoSender) {}

  subscribedTo(): typeof SendVideoCommand {
    return SendVideoCommand;
  }

  async handle(command: SendVideoCommand): Promise<void> {
    await this.useCase.execute(command);
  }
}
