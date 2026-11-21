import { ICommandHandler } from '@shared/domain/command/CommandHandler';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

import { MessageError } from '@modules/messages/application/MessageError';
import { SendStickerCommand } from '@modules/messages/application/sticker/SendStickerCommand';
import { StickerSender } from '@modules/messages/application/sticker/StickerSender';

export class SendStickerCommandHandler implements ICommandHandler<SendStickerCommand> {
  constructor(private readonly useCase: StickerSender) {}

  subscribedTo(): typeof SendStickerCommand {
    return SendStickerCommand;
  }

  async handle(command: SendStickerCommand): Promise<ISentMessage> {
    const result = await this.useCase.execute(command);
    if (!result) {
      throw new MessageError('Image message not sender');
    }

    return result;
  }
}
