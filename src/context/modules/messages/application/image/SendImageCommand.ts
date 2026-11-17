import { Command } from '@shared/domain/command/Command';
import { RequestFile } from '@shared/domain/RequestFile';

export class SendImageCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly image: RequestFile,
    public readonly caption?: string
  ) {
    super();
  }
}
