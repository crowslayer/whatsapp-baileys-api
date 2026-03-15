import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { LocationSender } from './LocationSender';
import { SendLocationCommand } from './SendLocationCommand';

export class SendLocationCommandHandler implements ICommandHandler<SendLocationCommand> {
  constructor(private readonly locationSender: LocationSender) {}

  subscribedTo(): typeof SendLocationCommand {
    return SendLocationCommand;
  }

  async handle(command: SendLocationCommand): Promise<void> {
    await this.locationSender.execute(command);
  }
}
