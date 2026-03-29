import { ContactSender } from '@application/messages/contact/ContactSender';
import { SendContactCommand } from '@application/messages/contact/SendContactCommand';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class SendContactCommandHandler implements ICommandHandler<SendContactCommand> {
  constructor(private readonly sender: ContactSender) {}

  subscribedTo(): typeof SendContactCommand {
    return SendContactCommand;
  }

  async handle(command: SendContactCommand): Promise<void> {
    await this.sender.execute(command);
  }
}
