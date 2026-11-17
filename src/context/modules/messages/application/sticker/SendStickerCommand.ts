import { Command } from '@shared/domain/command/Command';
import { RequestFile } from '@shared/domain/RequestFile';

export class SendStickerCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly sticker: RequestFile,
    public readonly isAnimated: boolean
  ) {
    super();
  }
}
