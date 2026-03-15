import { Command } from '@shared/domain/commands/Command';

export class SendStickerCommand extends Command<void> {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly sticker: Buffer
  ) {
    super();
  }
}
