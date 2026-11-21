import { ICommandHandler } from '@shared/domain/command/CommandHandler';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

import { LocationSender } from '@modules/messages/application/location/LocationSender';
import { SendLocationCommand } from '@modules/messages/application/location/SendLocationCommand';
import { MessageError } from '@modules/messages/application/MessageError';

export class SendLocationCommandHandler implements ICommandHandler<SendLocationCommand> {
  constructor(private readonly useCase: LocationSender) {}

  subscribedTo(): typeof SendLocationCommand {
    return SendLocationCommand;
  }

  async handle(command: SendLocationCommand): Promise<ISentMessage> {
    const result = await this.useCase.execute(command);
    if (!result) {
      throw new MessageError('Location message not sender');
    }

    return result;
  }
}
