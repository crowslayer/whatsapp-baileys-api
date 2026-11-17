import { Command } from '@shared/domain/command/Command';

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
