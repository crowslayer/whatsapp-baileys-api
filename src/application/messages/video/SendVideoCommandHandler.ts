import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { SendVideoCommand } from './SendVideoCommand';
import { VideoSender } from './VideoSender';

export class SendVideoCommandHandler implements ICommandHandler<SendVideoCommand> {
  constructor(private readonly videoSender: VideoSender) {}

  subscribedTo(): typeof SendVideoCommand {
    return SendVideoCommand;
  }

  async handle(command: SendVideoCommand): Promise<void> {
    await this.videoSender.execute(command);
  }
}
