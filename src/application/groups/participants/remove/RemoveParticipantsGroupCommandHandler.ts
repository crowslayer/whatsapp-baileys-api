import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { ParticipantsRemover } from './ParticipantsRemover';
import { RemoveParticipantsGroupCommand } from './RemoveParticipantsGroupCommand';

export class RemoveParticipantsGroupCommandHandler implements ICommandHandler<RemoveParticipantsGroupCommand> {
  constructor(private readonly remover: ParticipantsRemover) {}

  subscribedTo(): typeof RemoveParticipantsGroupCommand {
    return RemoveParticipantsGroupCommand;
  }

  async handle(command: RemoveParticipantsGroupCommand): Promise<void> {
    await this.remover.execute(command);
  }
}
