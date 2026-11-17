import { ICommandHandler } from '@shared/domain/command/CommandHandler';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';
import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

import { SendMessageCommand } from '@modules/messages/application/text/SendMessageCommand';
import { TextMessageSender } from '@modules/messages/application/text/TextMessageSender';

export class SendMessageCommandHandler implements ICommandHandler<SendMessageCommand> {
  constructor(private readonly useCase: TextMessageSender) {}

  subscribedTo(): typeof SendMessageCommand {
    return SendMessageCommand;
  }

  async handle(command: SendMessageCommand): Promise<ISentMessage | undefined> {
    const normalizer = new PhoneNormalizer();
    const jid = normalizer.toJid(command.to);
    if (!jid) {
      throw new Error('Phone invalid');
    }
    return this.useCase.execute({
      instanceId: command.instanceId,
      jid,
      message: command.message,
    });
  }
}
