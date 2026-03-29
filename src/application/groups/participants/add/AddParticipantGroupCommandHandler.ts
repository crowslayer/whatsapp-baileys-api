import { AddParticipantGroupCommand } from '@application/groups/participants/add/AddParticipantGroupCommand';
import { ParticipantsAggregator } from '@application/groups/participants/add/ParticipantsAggregator';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class AddParticipantGroupCommandHandler implements ICommandHandler<AddParticipantGroupCommand> {
  constructor(private readonly aggregator: ParticipantsAggregator) {}

  subscribedTo(): typeof AddParticipantGroupCommand {
    return AddParticipantGroupCommand;
  }

  async handle(command: AddParticipantGroupCommand): Promise<void> {
    await this.aggregator.execute(command);
  }
}
