import { ParticipantsRemover } from '@application/groups/participants/remove/ParticipantsRemover';
import { RemoveParticipantsGroupCommand } from '@application/groups/participants/remove/RemoveParticipantsGroupCommand';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class RemoveParticipantsGroupCommandHandler implements ICommandHandler<RemoveParticipantsGroupCommand> {
  constructor(private readonly remover: ParticipantsRemover) {}

  subscribedTo(): typeof RemoveParticipantsGroupCommand {
    return RemoveParticipantsGroupCommand;
  }

  async handle(command: RemoveParticipantsGroupCommand): Promise<void> {
    await this.remover.execute(command);
  }
}
