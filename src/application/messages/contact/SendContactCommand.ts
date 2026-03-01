import { Command } from '@shared/domain/commands/Command';

export class SendContactCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly contacts: Array<{
      displayName: string;
      vcard: string;
    }>
  ) {
    super();
  }
}
