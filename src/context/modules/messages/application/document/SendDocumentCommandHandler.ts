import { ICommandHandler } from '@shared/domain/command/CommandHandler';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

import { DocumentSender } from '@modules/messages/application/document/DocumentSender';
import { SendDocumentCommand } from '@modules/messages/application/document/SendDocumentCommand';

export class SendDocumentCommandHandler implements ICommandHandler<SendDocumentCommand> {
  constructor(private readonly useCase: DocumentSender) {}

  subscribedTo(): typeof SendDocumentCommand {
    return SendDocumentCommand;
  }

  handle(command: SendDocumentCommand): Promise<ISentMessage> {
    return this.useCase.execute(command);
  }
}
