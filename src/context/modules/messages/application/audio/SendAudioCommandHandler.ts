import { ICommandHandler } from '@shared/domain/command/CommandHandler';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

import { AudioSender } from '@modules/messages/application/audio/AudioSender';
import { SendAudioCommand } from '@modules/messages/application/audio/SendAudioCommand';

export class SendAudioCommandHandler implements ICommandHandler<SendAudioCommand> {
  constructor(private readonly useCase: AudioSender) {}

  subscribedTo(): typeof SendAudioCommand {
    return SendAudioCommand;
  }

  handle(command: SendAudioCommand): Promise<ISentMessage> {
    return this.useCase.execute(command);
  }
}
