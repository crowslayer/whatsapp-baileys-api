import { Command } from '@shared/domain/command/Command';

export class ConnectInstanceCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly usePairingCode?: boolean,
    public readonly phoneNumber?: string
  ) {
    super();
  }
}
