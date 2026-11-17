import { ICommandHandler } from '@shared/domain/command/CommandHandler';
import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

import { SendMessageCommand } from '@modules/messages/application/text/SendMessageCommand';
import { TextMessageSender } from '@modules/messages/application/text/TextMessageSender';

export class SendMessageCommandHandler implements ICommandHandler<SendMessageCommand> {
  constructor(private readonly useCase: TextMessageSender) {}

  subscribedTo(): typeof SendMessageCommand {
    return SendMessageCommand;
  }

  async handle(command: SendMessageCommand): Promise<void> {
    const normalizer = new PhoneNormalizer();
    const jid = normalizer.toJid(command.to);
    if (!jid) {
      throw new Error('Phone invalid');
    }
    await this.useCase.execute({ instanceId: command.instanceId, jid, message: command.message });
  }
}
