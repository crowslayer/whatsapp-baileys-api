import { Command } from '@shared/domain/command/Command';

export class DisconnectInstanceCommand extends Command<void> {
  constructor(public readonly instanceId: string) {
    super();
  }
}
