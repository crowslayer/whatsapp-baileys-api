import { Command } from '@shared/domain/command/Command';

export class CreateGroupCommand extends Command<string> {
  constructor(
    public readonly instanceId: string,
    public readonly name: string,
    public readonly participants: string[]
  ) {
    super();
  }
}
