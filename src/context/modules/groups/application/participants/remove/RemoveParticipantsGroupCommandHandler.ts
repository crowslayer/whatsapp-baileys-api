import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { ParticipantsRemover } from '@modules/groups/application/participants/remove/ParticipantsRemover';
import { RemoveParticipantsGroupCommand } from '@modules/groups/application/participants/remove/RemoveParticipantsGroupCommand';

export class RemoveParticipantsGroupCommandHandler implements ICommandHandler<RemoveParticipantsGroupCommand> {
  constructor(private readonly useCase: ParticipantsRemover) {}

  subscribedTo(): typeof RemoveParticipantsGroupCommand {
    return RemoveParticipantsGroupCommand;
  }

  async handle(command: RemoveParticipantsGroupCommand): Promise<void> {
    await this.useCase.execute(command);
  }
}
