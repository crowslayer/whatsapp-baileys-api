import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { AudioSender } from './AudioSender';
import { SendAudioCommand } from './SendAudioCommand';

export class SendAudioCommandHandler implements ICommandHandler<SendAudioCommand> {
  constructor(private readonly sender: AudioSender) {}

  subscribedTo(): typeof SendAudioCommand {
    return SendAudioCommand;
  }

  async handle(command: SendAudioCommand): Promise<void> {
    await this.sender.execute(command);
  }
}
