import { Command } from '@shared/domain/commands/Command';

export class SendAudioCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly audio: Buffer,
    public readonly ptt?: boolean, // Push to talk (nota de voz)
    public readonly mimetype?: string
  ) {
    super();
  }
}
