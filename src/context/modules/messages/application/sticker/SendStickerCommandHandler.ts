import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { SendStickerCommand } from '@modules/messages/application/sticker/SendStickerCommand';
import { StickerSender } from '@modules/messages/application/sticker/StickerSender';

export class SendStickerCommandHandler implements ICommandHandler<SendStickerCommand> {
  constructor(private readonly useCase: StickerSender) {}

  subscribedTo(): typeof SendStickerCommand {
    return SendStickerCommand;
  }

  async handle(command: SendStickerCommand): Promise<void> {
    await this.useCase.execute(command);
  }
}
