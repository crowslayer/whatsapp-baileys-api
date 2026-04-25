import { SendMessageCommand } from '@application/messages/text/SendMessageCommand';
import { TextMessageSender } from '@application/messages/text/TextMessageSender';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';
import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

export class SendMessageCommandHandler implements ICommandHandler<SendMessageCommand> {
  constructor(private readonly sender: TextMessageSender) {}

  subscribedTo(): typeof SendMessageCommand {
    return SendMessageCommand;
  }

  async handle(command: SendMessageCommand): Promise<void> {
    const normalizer = new PhoneNormalizer();
    const jid = normalizer.toJid(command.to);
    if (!jid) {
      throw new Error('Phone invalid');
    }
    await this.sender.execute(command.instanceId, jid, command.message);
  }
}
