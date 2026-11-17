import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { AddParticipantGroupCommand } from '@modules/groups/application/participants/add/AddParticipantGroupCommand';
import { ParticipantsAggregator } from '@modules/groups/application/participants/add/ParticipantsAggregator';

export class AddParticipantGroupCommandHandler implements ICommandHandler<AddParticipantGroupCommand> {
  constructor(private readonly useCase: ParticipantsAggregator) {}

  subscribedTo(): typeof AddParticipantGroupCommand {
    return AddParticipantGroupCommand;
  }

  async handle(command: AddParticipantGroupCommand): Promise<void> {
    await this.useCase.execute(command);
  }
}
