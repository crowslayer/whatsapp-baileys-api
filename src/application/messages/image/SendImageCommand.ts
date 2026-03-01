import { Command } from '@shared/domain/commands/Command';

export class SendImageCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly image: Buffer,
    public readonly caption?: string,
    public readonly fileName?: string
  ) {
    super();
  }
}
