import { Command } from '@shared/domain/command/Command';
import { RequestFile } from '@shared/domain/RequestFile';

export class SendDocumentCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly document: RequestFile,
    public readonly mimetype: string,
    public readonly caption?: string
  ) {
    super();
  }
}
