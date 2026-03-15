import { Command } from '@shared/domain/commands/Command';

export class SendVideoCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly video: Buffer,
    public readonly caption?: string,
    public readonly gifPlayback?: boolean,
    public readonly fileName?: string
  ) {
    super();
  }
}
