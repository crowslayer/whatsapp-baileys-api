import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { LocationSender } from '@modules/messages/application/location/LocationSender';
import { SendLocationCommand } from '@modules/messages/application/location/SendLocationCommand';

export class SendLocationCommandHandler implements ICommandHandler<SendLocationCommand> {
  constructor(private readonly useCase: LocationSender) {}

  subscribedTo(): typeof SendLocationCommand {
    return SendLocationCommand;
  }

  async handle(command: SendLocationCommand): Promise<void> {
    await this.useCase.execute(command);
  }
}
