import { Command } from '@shared/domain/command/Command';

export class CreateInstanceCommand extends Command<void> {
  constructor(
    public readonly name: string,
    public readonly webhookUrl?: string,
    public readonly usePairingCode?: boolean,
    public readonly phoneNumber?: string
  ) {
    super();
  }
}
