import { ICommandHandler } from '@shared/domain/command/CommandHandler';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

import { ContactSender } from '@modules/messages/application/contact/ContactSender';
import { SendContactCommand } from '@modules/messages/application/contact/SendContactCommand';

export class SendContactCommandHandler implements ICommandHandler<SendContactCommand> {
  constructor(private readonly useCase: ContactSender) {}

  subscribedTo(): typeof SendContactCommand {
    return SendContactCommand;
  }

  handle(command: SendContactCommand): Promise<ISentMessage> {
    return this.useCase.execute(command);
  }
}
