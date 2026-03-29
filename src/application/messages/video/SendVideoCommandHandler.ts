import { SendVideoCommand } from '@application/messages/video/SendVideoCommand';
import { VideoSender } from '@application/messages/video/VideoSender';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class SendVideoCommandHandler implements ICommandHandler<SendVideoCommand> {
  constructor(private readonly videoSender: VideoSender) {}

  subscribedTo(): typeof SendVideoCommand {
    return SendVideoCommand;
  }

  async handle(command: SendVideoCommand): Promise<void> {
    await this.videoSender.execute(command);
  }
}
