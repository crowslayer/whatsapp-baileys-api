import { Command } from '@shared/domain/commands/Command';

export class DeleteInstanceCommand extends Command<void> {
  constructor(public readonly instanceId: string) {
    super();
  }
}
