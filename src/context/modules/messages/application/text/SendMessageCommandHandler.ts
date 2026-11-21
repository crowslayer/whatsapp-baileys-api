import { ICommandHandler } from '@shared/domain/command/CommandHandler';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';
import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

import { MessageError } from '@modules/messages/application/MessageError';
import { SendMessageCommand } from '@modules/messages/application/text/SendMessageCommand';
import { TextMessageSender } from '@modules/messages/application/text/TextMessageSender';

export class SendMessageCommandHandler implements ICommandHandler<SendMessageCommand> {
  constructor(private readonly useCase: TextMessageSender) {}

  subscribedTo(): typeof SendMessageCommand {
    return SendMessageCommand;
  }

  async handle(command: SendMessageCommand): Promise<ISentMessage> {
    const normalizer = new PhoneNormalizer();
    const jid = normalizer.toJid(command.to);
    if (!jid) {
      throw new Error('Phone invalid');
    }
    const result = await this.useCase.execute({
      instanceId: command.instanceId,
      jid,
      message: command.message,
    });

    if (!result) {
      throw new MessageError('Message could not be sent');
    }

    return result;
  }
}
