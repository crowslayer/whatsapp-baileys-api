import { SendStickerCommand } from '@application/messages/sticker/SendStickerCommand';
import { StickerSender } from '@application/messages/sticker/StickerSender';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class SendStickerCommandHandler implements ICommandHandler<SendStickerCommand> {
  constructor(private readonly stickerSender: StickerSender) {}

  subscribedTo(): typeof SendStickerCommand {
    return SendStickerCommand;
  }

  async handle(command: SendStickerCommand): Promise<void> {
    await this.stickerSender.execute(command);
  }
}
