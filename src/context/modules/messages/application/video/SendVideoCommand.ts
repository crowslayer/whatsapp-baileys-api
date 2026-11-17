import { Command } from '@shared/domain/command/Command';
import { RequestFile } from '@shared/domain/RequestFile';

export class SendVideoCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly video: RequestFile,
    public readonly caption?: string,
    public readonly gifPlayback?: boolean,
    public readonly ptv?: boolean,
    public readonly jpegThumbnail?: string
  ) {
    super();
  }
}
