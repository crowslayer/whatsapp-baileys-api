import { LocationSender } from '@application/messages/location/LocationSender';
import { SendLocationCommand } from '@application/messages/location/SendLocationCommand';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class SendLocationCommandHandler implements ICommandHandler<SendLocationCommand> {
  constructor(private readonly locationSender: LocationSender) {}

  subscribedTo(): typeof SendLocationCommand {
    return SendLocationCommand;
  }

  async handle(command: SendLocationCommand): Promise<void> {
    await this.locationSender.execute(command);
  }
}
