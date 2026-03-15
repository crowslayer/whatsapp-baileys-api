import { Command } from '@shared/domain/commands/Command';

export class SendDocumentCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly document: Buffer,
    public readonly fileName: string,
    public readonly mimetype: string,
    public readonly caption?: string
  ) {
    super();
  }
}
