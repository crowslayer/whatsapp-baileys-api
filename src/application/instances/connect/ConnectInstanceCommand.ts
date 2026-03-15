import { Command } from '@shared/domain/commands/Command';

export class ConnectInstanceCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly usePairingCode?: boolean,
    public readonly phoneNumber?: string
  ) {
    super();
  }
}
