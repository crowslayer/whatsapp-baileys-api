import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { SendStickerCommand } from './SendStickerCommand';
import { StickerSender } from './StickerSender';

export class SendStickerCommandHandler implements ICommandHandler<SendStickerCommand> {
  constructor(private readonly stickerSender: StickerSender) {}

  subscribedTo(): typeof SendStickerCommand {
    return SendStickerCommand;
  }

  async handle(command: SendStickerCommand): Promise<void> {
    await this.stickerSender.execute(command);
  }
}
