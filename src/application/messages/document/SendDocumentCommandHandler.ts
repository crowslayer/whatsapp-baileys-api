import { DocumentSender } from '@application/messages/document/DocumentSender';
import { SendDocumentCommand } from '@application/messages/document/SendDocumentCommand';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class SendDocumentCommandHandler implements ICommandHandler<SendDocumentCommand> {
  constructor(private readonly sender: DocumentSender) {}

  subscribedTo(): typeof SendDocumentCommand {
    return SendDocumentCommand;
  }

  async handle(command: SendDocumentCommand): Promise<void> {
    await this.sender.execute(command);
  }
}
