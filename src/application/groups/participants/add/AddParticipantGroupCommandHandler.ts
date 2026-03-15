import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { AddParticipantGroupCommand } from './AddParticipantGroupCommand';
import { ParticipantsAggregator } from './ParticipantsAggregator';

export class AddParticipantGroupCommandHandler implements ICommandHandler<AddParticipantGroupCommand> {
  constructor(private readonly aggregator: ParticipantsAggregator) {}

  subscribedTo(): typeof AddParticipantGroupCommand {
    return AddParticipantGroupCommand;
  }

  async handle(command: AddParticipantGroupCommand): Promise<void> {
    await this.aggregator.execute(command);
  }
}
