import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { ContactSender } from './ContactSender';
import { SendContactCommand } from './SendContactCommand';

export class SendContactCommandHandler implements ICommandHandler<SendContactCommand> {
  constructor(private readonly sender: ContactSender) {}

  subscribedTo(): typeof SendContactCommand {
    return SendContactCommand;
  }

  async handle(command: SendContactCommand): Promise<void> {
    await this.sender.execute(command);
  }
}
