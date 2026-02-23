import { Command } from '@shared/domain/commands/Command';

export class DisconnectInstanceCommand extends Command<void> {
  constructor(public readonly instanceId: string) {
    super();
  }
}
