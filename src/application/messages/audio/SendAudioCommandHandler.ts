import { AudioSender } from '@application/messages/audio/AudioSender';
import { SendAudioCommand } from '@application/messages/audio/SendAudioCommand';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class SendAudioCommandHandler implements ICommandHandler<SendAudioCommand> {
  constructor(private readonly sender: AudioSender) {}

  subscribedTo(): typeof SendAudioCommand {
    return SendAudioCommand;
  }

  async handle(command: SendAudioCommand): Promise<void> {
    await this.sender.execute(command);
  }
}
