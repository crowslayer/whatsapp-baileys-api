import { Command } from '@shared/domain/command/Command';

export class DeleteInstanceCommand extends Command<void> {
  constructor(public readonly instanceId: string) {
    super();
  }
}
